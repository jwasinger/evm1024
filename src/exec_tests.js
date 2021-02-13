const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec;

const glob = require('glob')
const tempfile = require('tempfile')

function exec_evmone(code_file) {
    return new Promise(resolve => {
        command = path.normalize("evmone/build/bin/evmone-bench --benchmark_format=json --benchmark_color=false " + code_file + " 00 01")
/*
        console.log("executing\n" + command)
*/

        exec(command, (a, b, sdf) => { 
            resolve(b.includes("iterations") && !b.includes("error_message")) })
    })
}


glob("tests/*.hex", null, async (err, files) => {
    let failed = 0
    let passed = 0

    for (let i = 0; i < files.length; i++) {

        let result = await exec_evmone(files[i])
        if (!result) {
            // console.log("failed")
            failed++
        } else {
            passed++
        }
    }

    console.log("passed: " + passed.toString())
    console.log("failed: " + failed.toString())
})
