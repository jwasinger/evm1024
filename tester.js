const path = require('path')
const fs = require('fs')

const tempfile = require('tempfile')
const {gen_testcase} = require("./gen_testcase.js")
const exec = require('child_process').exec;

const { MontgomeryContext } = require("./montmul_reference.js")
const mont_context = new MontgomeryContext()

function exec_evmone(code_file) {
    return new Promise(resolve => {
        exec(path.normalize("evmone/build/bin/evmone-bench --benchmark_format=json --benchmark_color=false " + code_file + " 00 01"), (a, b, sdf) => { 
            resolve(b.includes("iterations") && !b.includes("error_message")) })
    })
}

// TODO get a list of primes up to max_num_limbs * 64 bits in size with good distribution of sizes

/*
const bls12381_modulus = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
const bls12381_modinv = 0x89f3fffcfffcfffdn
*/

/*
let test_case = gen_testcase("mulmodmont384", 0x7f202ee0640951a5f0eb674ed74980a3b5d4426e012e689b66ff1288c2c9f830a6475a277a9926d4d87f6cf748e6f705n, 2n, 2n, bls12381_modulus, bls12381_modinv)
let input_data = "0x7f202ee0640951a5f0eb674ed74980a3b5d4426e012e689b66ff1288c2c9f830a6475a277a9926d4d87f6cf748e6f705"
*/

let x = 2n
let y = 2n

let x_mont = mont_context.to_mont(x)
let y_mont = mont_context.to_mont(y)
let expected = mont_context.montmul(x_mont, y_mont)

let test_case = gen_testcase("mulmodmont384", expected.toString(16), x_mont.toString(16), y_mont.toString(16), mont_context.mod, mont_context.mod_inv)

console.log("testing " + x_mont.toString() + " * " + y_mont.toString() + " % " + mont_context.mod.toString() + " = " +  expected.toString())

code_tempfile = tempfile()

fs.writeFileSync(code_tempfile, test_case)

exec_evmone(code_tempfile).then((result) => {
    if (result === true) {
        console.log("passed")
    } else {
        console.log("failed")
    }
})
