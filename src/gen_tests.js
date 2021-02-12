const MontgomeryContext = require("./mont_context.js")
const { gen_from_mont_test, gen_to_mont_test } = require('./gen_test.js')

const test_x = 2n
const test_y = 3n

function gen_tests(modulus) {
    let mont_ctx = MontgomeryContext(modulus)

    const test_x_mont = mont_ctx.to_mont(test_x)
    const test_y_mont = mont_ctx.to_mont(test_y)

    assert.equal(test_x, mont_ctx.from_mont(test_x_mont))
    assert.equal(test_y, mont_ctx.from_mont(test_y_mont))

    let result = [
        gen_to_mont_test(test_x, mont_ctx),
        gen_from_mont_test(test_y, mont_ctx),
        gen_testcase("addmod384", (test_x_mont + test_y_mont) % mont_ctx.mod, test_x_mont, test_y_mont, mont_ctx),
        gen_testcase("submod384", (test_x_mont - test_y_mont) % mont_ctx.mod, test_x_mont, test_y_mont, mont_ctx),
        gen_test_case("mulmodmont384", mont_ctx.montmul(test_x_mont, test_y_mont), test_x_mont, test_y_mont, mont_ctx),
    ]

    return result
}

// pick a valid (odd) modulus for every limb size
// test to_mont, from_mont, add/sub/mulmodmont
const MAX_NUM_LIMBS = 16

const tests = []

for (let i = 0; i < MAX_NUM_LIMBS; i++) {
    mod = (1n << 64n * BigInt(i)) - 1
    tests = tests.concat(gen_tests(mod))
}

// also generate tests for predfined moduli (e.g. bn128 modulus curve order, bls12381 modulus and curve order)
