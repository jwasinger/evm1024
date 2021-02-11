# EVM1024 - variable-length modular addition/subtraction and montgomery multiplication up to 1024 bits.

## Setup

```
> npm install
> (git submodule update --init --recursive && \
cd evmone && \
mkdir build && \
cd build && \
cmake -DEVMONE_TESTING=ON .. && \
make)
```

## Usage
test 2 x 2 == 4 (4 x 64 bit modulus):
`npm run test`
