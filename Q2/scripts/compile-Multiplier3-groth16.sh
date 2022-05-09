#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom modeling after compile-HelloWorld.sh below
#!/bin/bash

cd contracts/circuits #expects to run from Q2 due to relative pathing

mkdir Multiplier3 #change directory name 

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom..." #change echo to reflect reality


# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3
#change circom command to target Multiplier3 circuit and output name changed to reflect this
snarkjs r1cs info Multiplier3/Multiplier3.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3/circuit_0000.zkey
#setup the zkey using correct r1cs but same powersofTau component, change zkey name to reflect this
snarkjs zkey contribute Multiplier3/circuit_0000.zkey Multiplier3/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
#contribute to the zkey (phase 2) but change the target key that is contributed to to the Multiplier3 key
snarkjs zkey export verificationkey Multiplier3/circuit_final.zkey Multiplier3/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3/circuit_final.zkey ../Multiplier3.sol


cd ../..