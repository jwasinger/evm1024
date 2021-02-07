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
        result += modinv_string
    } else if (typeof(modinv) != 'undefined') {
        throw("modinv parameter must be a bigint")
    }

    return result
}

function gen_mulmodmont_test_bytecode(x, y, mod, modinv) {
    const field_params_offset = 0
    let ops = []

    ops += gen_emplace_field_params(mod, modinv, field_params_offset)
}

// modulus from bn128, modinv from bls12381
let encoded = encode_field_params(21888242871839275222246405745257275088548364400416034343698204186575808495617n, 0x89f3fffcfffcfffdn)
