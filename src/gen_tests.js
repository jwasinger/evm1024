const fs = require('fs')
const path = require('path')
const assert = require('assert')

const { MontgomeryContext } = require("./mont_context.js")
const { gen_from_mont_test, gen_to_mont_test, gen_testcase } = require('./gen_test.js')

const test_x = 5n
const test_y = 3n

function gen_tests(modulus) {
    let mont_ctx = MontgomeryContext(modulus)

    const test_x_mont = mont_ctx.to_mont(test_x)
    const test_y_mont = mont_ctx.to_mont(test_y)

    assert.equal(test_x, mont_ctx.from_mont(test_x_mont))
    assert.equal(test_y, mont_ctx.from_mont(test_y_mont))

    let result = {}
    result[modulus.toString(16) + "-to_mont"] =  gen_to_mont_test(test_x, mont_ctx)
    result[modulus.toString(16) + "-from_mont"] = gen_from_mont_test(test_y, mont_ctx)
    result[modulus.toString(16) + "-addmod384"] = gen_testcase("addmod384", (test_x_mont + test_y_mont) % mont_ctx.mod, test_x_mont, test_y_mont, mont_ctx)
    result[modulus.toString(16) + "-submod384"] = gen_testcase("submod384", (test_x_mont - test_y_mont) % mont_ctx.mod, test_x_mont, test_y_mont, mont_ctx)
    result[modulus.toString(16) + "-mulmodmont384"] = gen_testcase("mulmodmont384", mont_ctx.montmul(test_x_mont, test_y_mont), test_x_mont, test_y_mont, mont_ctx)

    return result
}

function save_tests(directory, tests) {
    let entries = Object.entries(tests)
    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i]
        fs.writeFileSync(path.join(path.normalize(directory), entry[0] + ".hex"), entry[1])
    }
}

// pick a valid (odd) modulus for every limb size
// test to_mont, from_mont, add/sub/mulmodmont
const MAX_NUM_LIMBS = 10

console.log("generating tests")

let tests = {}

for (let i = 2; i < MAX_NUM_LIMBS; i++) {
    mod = (1n << 64n * BigInt(i)) - 1n
    tests = Object.assign(tests, gen_tests(mod))
}

// also generate tests for predfined moduli (e.g. bn128 modulus curve order, bls12381 modulus and curve order)

save_tests("./tests", tests)
console.log("tests saved to disk")
