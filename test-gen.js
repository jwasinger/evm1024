/*
basic test does:
1) emplace evm384 field parameters and test values in right memory locations
2) execute evm384 opcode and return result
*/

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
    if (mod_string.length % 2 != 0) {
        mod_string = '0' + mod_string
    }

    let fill_len = mod_string.length % 16
    mod_string = '0'.repeat(fill_len) + mod_string 

    let num_limbs = mod_string.length / 16
    if (num_limbs == 0 || num_limbs > 6) {
        throw("word size must be between 1 and 6 64-bit limbs")
    }

    let num_limbs_string = '0' + num_limbs.toString(16)

    result += num_limbs_string

    // encode as LE
    mod_string = reverse_endianness(mod_string)
    result += mod_string

    if (typeof(modinv) == "bigint") {
        let modinv_string = modinv.toString(16)
        if (modinv_string.length > 16) {
            throw("modinv is a 64 bit number")
        }

        fill_len = 16 - modinv_string.length
        modinv_string = '0'.repeat(fill_len) + modinv_string
        result += reverse_endianness(modinv_string)
    } else if (typeof(modinv) != 'undefined') {
        throw("modinv parameter must be a bigint")
    }

    return result
}

function encode_value(value, num_limbs) {

}

// modulus from bn128, modinv from bls12381
let encoded = encode_field_params(21888242871839275222246405745257275088548364400416034343698204186575808495617n, 0x89f3fffcfffcfffdn)
console.log(encoded)

function gen_testcase(operation, x, y, modulus, modinv) {
    ops = []

    const num_limbs = calc_num_limbs(modulus)
    const out_offset = 0
    const x_offset = out_offset + 8 * num_limbs
    const y_offset = x_offset + 8 * num_limbs
    const field_params_offset = y_offset + 8 * num_limbs

    ops += [
        gen_mstore_multi(field_params_offset, encode_field_params(modulus, modinv)),
        gen_mstore_multi(offset_x, encode_value(offset_x, num_limbs)),
        gen_mstore_multi(offset_y, encode_value(offset_y, num_limbs)),
        gen_mstore_multi(offset_out, encode_value(0, num_limbs)),
        gen_evm384_op(operation, offset_out, offset_x, offset_y, field_params_offset),
        gen_return(offset_out, num_limbs * 8)
    ]
}
