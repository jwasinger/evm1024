# EVM1024 - variable-length modular addition/subtraction and montgomery multiplication up to 1024 bits.

This repository contains a test suite and test runner for a new iteration on EVM384-v7 that I am tentatively calling "EVM1024".

EVM1024 differs from EVM384-v7 in the following ways:
* The size of packed offsets is reduced to 2 bytes, a limb-count selector byte is prepended to the packed offsets. So the input becomes the first 9 bytes of the stack value parameter and they are interpreted as `<num_limbs / 1byte><offset_result / 2bytes><offset_x / 2bytes><offset_y / 2bytes><offset_params / 2bytes>` where all packed values are little-endian.
* The size of values that are operated on now becomes `num_limbs * 8` (64 bit limbs) instead of 48bytes in EVM384-v7
* gas cost is TBD and based on future benchmarking/optimization.  Likely it will be a step function with a base cost + a cost per limb that scales linearly per-limb for addmod/submod and quadratically per-limb for mulmodmont.

### note on the test suite:
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
