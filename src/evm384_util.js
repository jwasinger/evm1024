const { gen_push, uint16_to_be_hex, uint8_to_hex } = require("./evm_util.js")

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

function encode_offsets(num_limbs, out, x, y, curve_params) {
    return uint8_to_hex(num_limbs) + 
        uint16_to_be_hex(out) +
        uint16_to_be_hex(x) +
        uint16_to_be_hex(y) +
        uint16_to_be_hex(curve_params)
}

function encode_field_params(modulus, modinv) {
    let result = ''

    let mod_string = modulus.toString(16)

    let num_limbs = Math.ceil(mod_string.length / 16)
    if (num_limbs == 0 || num_limbs > 16) {
        throw("word size must be between 1 and 6 64-bit limbs")
    }

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

function gen_evm384_op(operation, num_limbs, offset_out, offset_x, offset_y, offset_field_params) {
    let func = null

    if (operation == 'addmod384') {
        func = gen_addmod384
    } else if (operation == 'submod384') {
        func = gen_submod384
    } else if (operation == 'mulmodmont384') {
        func = gen_mulmodmont384
    } else {
        throw("operation must be mulmodmont384, addmod384 or submod384")
    }

    return func(num_limbs, offset_out, offset_x, offset_y, offset_field_params)
}

const EVM384_OPS = {
    ADDMOD384: "c0",
    SUBMOD384: "c1",
    MULMODMONT384: "c2",
}

function gen_addmod384(num_limbs, offset_out, offset_x, offset_y, offset_mod) {
    return gen_push(encode_offsets(num_limbs, offset_out, offset_x, offset_y, offset_mod)) + EVM384_OPS.ADDMOD384
}

function gen_submod384(num_limbs, offset_out, offset_x, offset_y, offset_mod) {
    return gen_push(encode_offsets(num_limbs, offset_out, offset_x, offset_y, offset_mod)) + EVM384_OPS.SUBMOD384
}
function gen_mulmodmont384(num_limbs, offset_out, offset_x, offset_y, offset_mod) {
    return gen_push(encode_offsets(num_limbs, offset_out, offset_x, offset_y, offset_mod)) + EVM384_OPS.MULMODMONT384
}

module.exports = {
    EVM384_OPS,
    encode_value,
    gen_evm384_op,
    encode_field_params,
    reverse_endianness,
    calc_num_limbs,
}
