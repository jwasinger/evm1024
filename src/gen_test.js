const { gen_calldatacopy, gen_equals, gen_return, gen_mstore, gen_mstore_multi, gen_push, gen_pop } = require('./evm_util.js')
const { encode_value, gen_evm384_op, calc_num_limbs, encode_field_params, gen_mulmodmont384, gen_addmod384, gen_submod384, gen_muldmod384} = require("./evm384_util.js")

function gen_testcase(operation, expected, x, y, mont_ctx) {

    let modulus = mont_ctx.mod
    let modinv = mont_ctx.mod_inv

    const buffering = 32 //mstoremulti currently only writes in multiples of 32 bytes (TODO fix that)

    const num_limbs = calc_num_limbs(modulus)
    const offset_out = 0
    const offset_x = offset_out + 8 * num_limbs + buffering
    const offset_y = offset_x + 8 * num_limbs + buffering
    const offset_field_params = offset_y + 8 * num_limbs + buffering
    const offset_expected = offset_field_params + 8 * num_limbs + buffering
    const offset_equality_check_result = offset_expected + 8 * num_limbs + buffering

    // TODO validate field params here

    let ops = [
        gen_mstore_multi(offset_expected, encode_value(expected, num_limbs)),
        gen_mstore_multi(offset_field_params, encode_field_params(modulus, modinv)),
        gen_mstore_multi(offset_x, encode_value(x, num_limbs)),
        gen_mstore_multi(offset_y, encode_value(y, num_limbs)),
        gen_mstore_multi(offset_out, encode_value(0, num_limbs))]

    let bench_iterations = 1;
    for (let i = 0; i < bench_iterations; i++) {
        ops = ops.concat(gen_evm384_op(operation, num_limbs, offset_out, offset_x, offset_y, offset_field_params))
    }

    ops = ops.concat([
        gen_equals(offset_equality_check_result, offset_out, offset_expected, num_limbs),
        gen_return(offset_equality_check_result, 1)
    ])

    return ops.join("")
}

function gen_from_mont_test(val_norm, mont_ctx) {
    const val_mont = mont_ctx.to_mont(val_norm)

    return gen_testcase("mulmodmont384", val_norm, val_mont, 1n, mont_ctx)
}

function gen_to_mont_test(val_norm, mont_ctx) {
    const val_mont = mont_ctx.to_mont(val_norm)

    return gen_testcase("mulmodmont384", val_mont, val_norm, mont_ctx.r_squared, mont_ctx)
}

module.exports = {
    gen_testcase,
    gen_to_mont_test,
    gen_from_mont_test,
}
