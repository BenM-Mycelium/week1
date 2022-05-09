#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom using PLONK below

cd contracts/circuits #expects to run from Q2 due to relative pathing

mkdir Multiplier3_plonk #change directory name 

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom with plonk... " #change echo to reflect reality


# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3_plonk
#change circom command to target Multiplier3 circuit and output name changed to reflect this
snarkjs r1cs info Multiplier3_plonk/Multiplier3.r1cs

# Start a new zkey and make a contribution

snarkjs plonk setup Multiplier3_plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3_plonk/circuit_0000.zkey

#removed contribution to zkey as it is not needed for plonk

snarkjs zkey export verificationkey Multiplier3_plonk/circuit_0000.zkey Multiplier3_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3_plonk/circuit_0000.zkey ../Multiplier3_plonk.sol


cd ../..