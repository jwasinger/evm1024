const assert = require("assert")

function MontgomeryContext() {
    // TODO assert modulus % 2 != 0
    let self = this

    // r is 1<<modulus_bits
    self.r = 6350874878119819312338956282401532410528162663560392320966563075034087161851n

    // TODO method to calculate r_inv.  just hardcode for now
    self.r_inv = 9915499612839321149637521777990102151350674507940716049588462388200839649614n // (r_inv * r) % mod == 1
    self.mod = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

    //self.r_inv = 0n // pow(-self.r, -1, self.mod)

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

ctx = new MontgomeryContext()
x = 2n
y = 2n

x_mont = ctx.to_mont(x)
y_mont = ctx.to_mont(y)

assert.equal(ctx.from_mont(x_mont), x)
assert.equal(ctx.from_mont(y_mont), y)
assert.equal(ctx.montmul(x_mont, y_mont) == ctx.to_mont(4n))
