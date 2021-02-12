const assert = require("assert")
const bigintModArith = require('bigint-mod-arith')

function count_occupied_limbs(num) {
    for (let i = 0; ; i++) {
        if (1n << (BigInt(i) * 64n) > num) {
            return i
        }
    }
}

function MontgomeryContext(modulus) {
    let self = this

    assert.equal(typeof(modulus), "bigint")

    // TODO assert modulus % 2 != 0
    assert.notEqual(modulus % 2n, 0n)

    // TODO find num_limbs occupied by modulus
    let num_limbs = BigInt(count_occupied_limbs(modulus))

    self.mod = modulus

    // choose r s.t. r > modulus, r occupies all limbs (num_limbs) and is a power of 2
    self.r = (1n << (num_limbs * 64n)) % self.mod
    self.r_inv = bigintModArith.modInv(self.r, self.mod)

    // the montgomery constant parameter used in multiprecision montmul
    self.mod_inv = bigintModArith.modInv(-self.mod, (1n << 64n))

    self.from_mont = (val_mont) => {
        return (val_mont * self.r_inv) % self.mod
    }

    self.to_mont = (val_norm) => {
        return (val_norm * self.r) % self.mod
    }

    self.montmul = (a_mont, b_mont) => {
        return ((a_mont * b_mont % self.mod) * self.r_inv) % self.mod
    }
}

const bn128_modulus = 21888242871839275222246405745257275088548364400416034343698204186575808495617n
ctx = new MontgomeryContext(bn128_modulus)
x = 2n
y = 2n

x_mont = ctx.to_mont(x)
y_mont = ctx.to_mont(y)

assert.equal(ctx.from_mont(x_mont), x)
assert.equal(ctx.from_mont(y_mont), y)
assert.equal(ctx.montmul(x_mont, y_mont), ctx.to_mont(4n))

module.exports = {
    MontgomeryContext
}
