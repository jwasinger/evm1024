# EVM1024 - variable-length modular addition/subtraction and montgomery multiplication up to 1024 bits.


This repository contains a test suite and test runner for a new iteration on EVM384-v7 that I am tentatively calling "EVM1024".

Tests (under `tests`) are self-contained evm bytecode which emplace inputs and an expected value in memory, perform an EVM1024 operation (addmod/submod/mulmodmont) and return '01' if the computed result matches what is expected, or '00' if it does not.  Translating these tests into proper state tests is tbd.

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

Run all tests: `npm run test`
Regenerate tests: `npm run build`
