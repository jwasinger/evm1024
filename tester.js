const path = require('path')
const {gen_testcase} = require("./gen_testcase.js")
const exec = require('child_process').exec;

function exec_geth(code, input_data) {
    debugger
    return new Promise(resolve => {
        debugger
        exec(path.normalize("go-ethereum/build/bin/evm --statdump --code " + code + " --input " + input_data + " run"), (a, b, sdf) => { 
            resolve(b.slice(2, -1)) })
    })
}

// TODO get a list of primes up to max_num_limbs * 64 bits in size with good distribution of sizes

const bls12381_modulus = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
const bls12381_modinv = 0x89f3fffcfffcfffdn

let test_case = gen_testcase("mulmodmont384", 0x7f202ee0640951a5f0eb674ed74980a3b5d4426e012e689b66ff1288c2c9f830a6475a277a9926d4d87f6cf748e6f705n, 2n, 2n, bls12381_modulus, bls12381_modinv)
let input_data = "0x7f202ee0640951a5f0eb674ed74980a3b5d4426e012e689b66ff1288c2c9f830a6475a277a9926d4d87f6cf748e6f705"

exec_geth(test_case, input_data).then((result) => {
    if (result === '01') {
        console.log("passed")
    } else {
        console.log("failed")
    }
})
