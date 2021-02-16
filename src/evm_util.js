const assert = require('assert')

function to_padded_hex(value) {
    if (typeof(value) === "number" || typeof(value) === "bigint") {
        value = value.toString(16)
    } else {
        assert(typeof(value) === "string")
    }
    if (value.length % 2 !== 0) {
        return "0" + value
    }
    return value
}


// convert a uint64 to a padded little endian hex string
function uint16_to_be_hex(num) {
    result = num.toString(16)
    fill_length = 8 - result.length

    if (fill_length > 0) {
        result = "0".repeat(fill_length) + result
    }

    return result
}

function gen_mstore(offset, value) {
    return gen_push(value) + gen_push(offset) + "52"
}

function gen_mload() {
    return "51"
}

function gen_iszero() {
    return "15"
}

function gen_eq() {
    return "14"
}

function gen_or() {
    return "17"
}

function gen_shl() {
    return "1b"
}

function gen_shr() {
    return "1c"
}

function gen_jumpdest() {
    return "5b"
}

function gen_jumpi() {
    return "57"
}

function gen_callvalue() {
    return "34"
}

function gen_calldatacopy(offset_dst, offset_src, size) {
    return gen_push(size) + gen_push(offset_src) + gen_push(offset_dst) + "37"
}

function gen_return(offset, n_bytes) {
    return gen_push(n_bytes) + gen_push(offset) + "f3"
}

function gen_revert() {
    return "fd";
}

function gen_with_immediate(base_op, value) {
    value = to_padded_hex(value)

    if (value.length > 64) {
        throw("push value size must not be larger than 32 bytes")
    } else if (value.length < 2) {
        throw("push value size must not be smaller than 1 byte")
    }

    return to_padded_hex(base_op + (value.length / 2) - 1) + value
}

function gen_push(value) {
    return gen_with_immediate(0x60, value)
}

function gen_dup(value) {
    assert(value >= 1 && value <= 16)
    return to_padded_hex(0x80 + value - 1)
}

function gen_swap(value) {
    assert(value >= 1 && value <= 16)
    return to_padded_hex(0x90 + value - 1)
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


// generate multiple mstores for arbitrary sized big-endian value
function gen_mstore_multi(offset, value) {
    if (value.length <= 64) {
        return gen_mstore(offset, value)
    }

    const zero_fill_len = 64 - (value.length % 64)

    let filled_value = value + '0'.repeat(zero_fill_len)
    let result = []

    for (let i = 0; i < filled_value.length / 64; i++) {
        result.push(gen_mstore(offset + i * 32, filled_value.slice(i * 64, (i + 1) * 64)))
    }

    return result.join("")
}

const constants  = {
    OP_MSTORE8: "53",
    OP_SHA3: "20"
}

function gen_pop() {
    return '50'
}

function gen_sha3(offset, size) {
    return gen_push(size) + gen_push(offset) + constants.OP_SHA3
}

function uint8_to_hex(val) {
    let val_str = val.toString(16)
    if (val_str.length > 2 || val > 255) {
        throw("invalid num for byte (>255)")
    } else if (val_str.length == 1) {
        return '0' + val_str
    } else {
        return val_str
    }
}

// compare values at memory in offset_val1 and offset_val2.  write 1 (byte) to memory at offset_result if equal, 0 if not.
function gen_equals(offset_result, offset_val1, offset_val2, num_limbs) {
    let result = [
        gen_sha3(offset_val1, num_limbs * 8),
        gen_sha3(offset_val2, num_limbs * 8),
        gen_eq(),
        gen_push(offset_result),
        constants.OP_MSTORE8
    ]

    return result.join("")
}

module.exports = {
    gen_push: gen_push,
    gen_pop: gen_pop,
    gen_dup: gen_dup,
    gen_swap: gen_swap,
    uint8_to_hex: uint8_to_hex,
    uint16_to_be_hex: uint16_to_be_hex,
    // store single 32 byte word at offset
    gen_mstore: gen_mstore,
    gen_mload: gen_mload,
    gen_iszero: gen_iszero,
    gen_eq: gen_eq,
    gen_or: gen_or,
    gen_shl: gen_shl,
    gen_shr: gen_shr,
    gen_jumpdest: gen_jumpdest,
    gen_jumpi: gen_jumpi,
    gen_callvalue: gen_callvalue,
    gen_calldatacopy: gen_calldatacopy,
    gen_return: gen_return,
    gen_revert: gen_revert,
    gen_equals: gen_equals,
    gen_mstore_multi: gen_mstore_multi,
    constants: constants,
}
