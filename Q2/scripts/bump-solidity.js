const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract HelloWorldVerifier');

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment

content = fs.readFileSync("./contracts/Multiplier3.sol", { encoding: 'utf-8' });
//re-assign content to read from Multiplier3.sol (groth16 version)
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
//reassign bumped to content with replaced soldiity version
bumped = bumped.replace(verifierRegex, 'contract Multiplier3');
//reassign bumped once more to replace the contract name definition
fs.writeFileSync("./contracts/Multiplier3.sol", bumped);
//write changes to the file (sync file diffs)

content = fs.readFileSync("./contracts/Multiplier3_plonk.sol", { encoding: 'utf-8' });
//re-assign content to read from Multiplier3.sol (groth16 version)
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
//reassign bumped to content with replaced soldiity version
bumped = bumped.replace(verifierRegex, 'contract Multiplier3_plonk');
//reassign bumped once more to replace the contract name definition
fs.writeFileSync("./contracts/Multiplier3_plonk.sol", bumped);
//write changes to the file (sync file diffs)