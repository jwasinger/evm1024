const {gen_return, gen_mstore, gen_mstore_multi, gen_mulmodmont384, gen_addmod384, gen_submod384, gen_muldmod384} = require('./util.js')

/*
basic test does:
1) emplace evm384 field parameters and test values in right memory locations
2) execute evm384 opcode and return result
*/

function calc_num_limbs(value) {
    return Math.ceil(value.toString(16).length / 16)
}

function reverse_endianness(val) {
    if (val.length % 2 != 0) {
        throw("value length must be even")
    }

    let parts = []
    for (let i = 0; i < val.length; i += 2) {
        parts.push(val.slice(i, i + 2))
    }
    parts.reverse()

    return parts.join("")
}

function encode_field_params(modulus, modinv) {
    let result = ''

    let mod_string = modulus.toString(16)

    let num_limbs = Math.ceil(mod_string.length / 16)
    if (num_limbs == 0 || num_limbs > 6) {
        throw("word size must be between 1 and 6 64-bit limbs")
    }

    let num_limbs_string = '0' + num_limbs.toString(16)

    result += num_limbs_string

    result += encode_value(mod_string, num_limbs)

    if (typeof(modinv) == "bigint") {
        let modinv_string = modinv.toString(16)
        if (modinv_string.length > 16) {
            throw("modinv is a 64 bit number")
        }

        result += reverse_endianness(modinv_string)
    } else if (typeof(modinv) != 'undefined') {
        throw("modinv parameter must be a bigint")
    }

    return result
}

function encode_value(value, num_limbs) {
    let val_str = value.toString(16)
    let fill_len = (num_limbs * 16) - val_str.length
    return reverse_endianness("0".repeat(fill_len) + val_str)
}

function gen_evm384_op(operation, offset_out, offset_x, offset_y, offset_field_params) {
    let func = null

    debugger
    if (operation == 'addmod384') {
        func = gen_addmod384
    } else if (operation == 'submod384') {
        func = gen_submod384
    } else if (operation == 'mulmodmont384') {
        func = gen_mulmodmont384
    } else {
        throw("operation must be mulmodmont384, addmod384 or submod384")
    }

    return func(offset_out, offset_x, offset_y, offset_field_params)
}

function gen_testcase(operation, x, y, modulus, modinv) {

    const buffering = 32 //mstoremulti currently only writes in multiples of 32 bytes (TODO fix that)

    const num_limbs = calc_num_limbs(modulus)
    const offset_out = 0
    const offset_x = offset_out + 8 * num_limbs + buffering
    const offset_y = offset_x + 8 * num_limbs + buffering
    const offset_field_params = offset_y + 8 * num_limbs + buffering
    const offset_r_inv = offset_field_params + 8 * num_limbs + buffering
    const offset_one = offset_field_params + 8 * num_limbs + buffering

    // TODO validate field params here

    //TODO compute r_inv
    const r_inv = 0

    let ops = [
        gen_mstore_multi(offset_field_params, encode_field_params(modulus, modinv)),
        gen_mstore_multi(offset_one, encode_value(1n, num_limbs)),
        gen_mstore_multi(offset_r_inv, encode_value(r_inv, num_limbs)),
        gen_mstore_multi(offset_x, encode_value(x, num_limbs)),
        gen_mstore_multi(offset_y, encode_value(y, num_limbs)),
        gen_mstore_multi(offset_out, encode_value(0, num_limbs)),
        gen_evm384_op(operation, offset_out, offset_x, offset_y, offset_field_params),
        gen_return(offset_out, num_limbs * 8)
    ]

    console.log(ops.join(""))
}

const bls12381_modulus = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
const bls12381_modinv = 0x89f3fffcfffcfffdn

gen_testcase("mulmodmont384", 2n, 2n, bls12381_modulus, bls12381_modinv)
