const fs = require('fs')
const path = require('path')
const assert = require('assert')

const { MontgomeryContext } = require("./mont_context.js")
const { gen_from_mont_test, gen_to_mont_test, gen_testcase } = require('./gen_test.js')

const test_x = 5n
const test_y = 3n

function gen_tests(name, modulus) {
    let mont_ctx = MontgomeryContext(modulus)

    const test_x_mont = mont_ctx.to_mont(test_x)
    const test_y_mont = mont_ctx.to_mont(test_y)

    assert.equal(test_x, mont_ctx.from_mont(test_x_mont))
    assert.equal(test_y, mont_ctx.from_mont(test_y_mont))

    let result = {}
    result[name  + "-to_mont"] =  gen_to_mont_test(test_x, mont_ctx)
    result[name + "-from_mont"] = gen_from_mont_test(test_y, mont_ctx)
    result[name + "-addmod384"] = gen_testcase("addmod384", (test_x_mont + test_y_mont) % mont_ctx.mod, test_x_mont, test_y_mont, mont_ctx)

    // TODO generate submod tests where x > y, y < x, y == x
    // TODO fix submod tests
    // result[name + "-submod384"] = gen_testcase("submod384", mont_ctx.submod(test_x_mont, test_y_mont), test_x_mont, test_y_mont, mont_ctx)

    result[name + "-mulmodmont384"] = gen_testcase("mulmodmont384", mont_ctx.montmul(test_x_mont, test_y_mont), test_x_mont, test_y_mont, mont_ctx)

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

// TODO fix this generation and re-incorporate these tests
// TODO check with limb-size = 1
for (let i = 2; i < MAX_NUM_LIMBS; i++) {
    mod = (1n << 64n * BigInt(i)) - 1n
    tests = Object.assign(tests, gen_tests("max-mod-"+i.toString(), mod))
}

const bn128_curve_order = 21888242871839275222246405745257275088548364400416034343698204186575808495617n
tests = Object.assign(tests, gen_tests("bn128_curve_order", bn128_curve_order))

const bls12381_modulus = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
tests = Object.assign(tests, gen_tests("bls12381", bls12381_modulus))

save_tests("./tests", tests)
console.log("tests saved to disk")
