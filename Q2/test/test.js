const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        //if o is a sting and passes some regex to check if its a string of digits
        return BigInt(o);
        //then return 0 as a bigint type (cast it to bigint)
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        //else if its a string and fits with some other regex to check if its a hexadecimal number then cast to bigint also
        return BigInt(o);
        //return as a bigint 
    } else if (Array.isArray(o)) {
        //if its an array then use unstringifyBigInts on each element to parse it out to as needed (essentially using other if statements in this function) using this function as a callback (recursive)
        return o.map(unstringifyBigInts);
        //return the array with each element casted to bigint
    } else if (typeof o == "object") {
        if (o===null) return null;
        //if its an empty object then return null (script comparison (=== vs ==))
        const res = {};
        //declare an empty object res
        const keys = Object.keys(o);
        //declare keys which stores the names of all the parameters of o (input)
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
            //for each key in keys, set the value of res[k] to the value of o[k] casted to bigint
        });
        return res;
        //return the object res
    } else {
        return o;
        //else if nothing is caught return the input
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        //declare some public signals to use in a unit test, a=1, b=2 etc, and also specify the wasm and key file to use for the test
        console.log('1x2 =',publicSignals[0]);
        //log 1x2= public signal output

        //call unstringifyBigint (see commented function above, but basically convert type to BigInt or BigInt set (object or array of bigints))
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //same as above but with the proof
        const editedProof = unstringifyBigInts(proof);
        //transform the proof and public signals into a solidity call data string to pass into the verification contract to check the proof
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        console.log('calldata =',calldata);
        //calldata = ["0x2acf76587827f791811232e4697872399c8f90fdf8a2bb3cfe16018218090911", "0x1b7e9fd9c2a1cbbc05fc8ffa5629fadb0482ec1b508cb3b25f1cf0c144d7d9eb"],
        //[["0x1b15cf7b4cc0f37bc1e2c56b8db31d56e715c9b17614a191e54e56315c71cde7", "0x2ec3485a34951833ee7a856bfcfa55b40d39e3137d74f716ed6086fa1234494e"],
        //["0x2dc88809472e5b92657d2e224c99cc2722f10882d3fdf09c376d5ffc30641b41", "0x1b751cf6eed80000fb774105359ce7ca1ce08130ffa2eb267b1b0b5bd36abd03"]],
        //["0x171399f1d1c76f9d47e5a0499497b20a3e34009414312bcffa4245d3f2499cd8", "0x298fd054ea51396cc433d4fbd36461fa3e81f47f81f9f47efdaf6b880a11657e"],
        //["0x0000000000000000000000000000000000000000000000000000000000000002"]


        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        //break apart each string in the the calldata array ignoring the internal arrays they are in an converts it to a bigint and then to a string
        //example 0x2acf76587827f791811232e4697872399c8f90fdf8a2bb3cfe16018218090911 is the hex of 19363693774104458360388818201734794200466567943367511710529033939385819138321
        console.log('argv =',argv);
        /*
        argv = [
        '19363693774104458360388818201734794200466567943367511710529033939385819138321',
        '12436172890384978913735459286024956934414660447571072664017066153479532698091',
        '12250982685758873911577794370769707020369328825913336511517352826160131722727',
        '21151425570131780877609848774845339873409437509198795483369536248043363649870',
        '20708386486841591024931233723338779540450241758257564689174057987715534953281',
        '12419367924525036376862315709056117031113200548809864421842672772226904407299',
        '10437828098276434142258182340874817544747789359583374020488787546129165819096',
        '18798923774729373356292748117878761346438576199839716828154009760669233145214',
        '2'
        ]
        */
        
        //because when argv was contructed out of the calldata ignoring the interal arrays, all of the data has to be put back into 
        //those array structures. This explains a,b and c and input (input is the 2 at the end (0x0000000000000000000000000000000000000000000000000000000000000002))
        const a = [argv[0], argv[1]];
        console.log('a =',a);

        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        console.log('b =',b);

        const c = [argv[6], argv[7]];
        console.log('c =',c);

        //input here constitutes the correct answer to the inputs (2 == 1x2)
        const Input = argv.slice(8);
        console.log('Input =',Input);

        //call the verifyProof function in the helloworldverifier contract and use a,b,c and input as the input to the function
        //expect that this function returns true
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        //declare garbage input data

        //call the function with the garbage input data and expect it to return false
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3");
        verifier = await Verifier.deploy();
        await verifier.deployed();
        
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3",}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        console.log('1x2x3 =',publicSignals[0]);
        //call unstringifyBigint (see commented function above, but basically convert type to BigInt or BigInt set (object or array of bigints))
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //same as above but with the proof
        const editedProof = unstringifyBigInts(proof);
        //transform the proof and public signals into a solidity call data string to pass into the verification contract to check the proof
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        console.log('calldata =',calldata);

        //verifying with logs to see if the calldata structure is the same/different. Makes sense it is the same because the different virifier contract takes the same inputs

        //calldata = calldata = ["0x0c1163db848885ab98eeaf3a65223db5b847ca7aa9e25e80a26b963f8fa5e71c", "0x19a5f4a668a608c616e0978179c8baaee6ced3cb118dbeca171806952f0eae75"],
        //[["0x1d8c5c3d84e5fc7798eaa6a2702b9f5c070b988e8bc4f0c74ae2e4cf18043fcc", "0x16f9eaa9b81b022cea6190146d82103e5c1b7431870d4cd56de62b42f7fb74c2"],
        //["0x0fea49aac5c6e269bf9f2051ae35273bee3428bbe8bb61f6844d4d84ac623d71", "0x02d71db1f9867ff7afb8b87662cd48a2583d2b2feb97e9c28aa50bafc0463994"]],
        //["0x170ca8a4bcc60f6af110cafb083a5e61b6fb2306eead27aa4c9bdb28fe6ea0c7", "0x02db3162afff8bec009765952e0fbf0a5acd24c2270299895d50db5069ebcd88"],
        //["0x0000000000000000000000000000000000000000000000000000000000000006"]

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        console.log('a =',a);

        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        console.log('b =',b);

        const c = [argv[6], argv[7]];
        console.log('c =',c);

        //input here constitutes the correct answer to the inputs (2 == 1x2)
        const Input = argv.slice(8);
        console.log('Input =',Input);
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        //declare garbage input data

        //call the function with the garbage input data and expect it to return false
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here

        //plonk contract verifyProof takes different arguments so the calldata structure is likely different, should explore this to get the test working
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3",}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_0000.zkey");
        console.log('1x2x3 =',publicSignals[0]);

        //call unstringifyBigint (see commented function above, but basically convert type to BigInt or BigInt set (object or array of bigints))
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //same as above but with the proof
        const editedProof = unstringifyBigInts(proof);
        //transform the proof and public signals into a solidity call data string to pass into the verification contract to check the proof
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        console.log('calldata =',calldata);

        //check what the calldata looks like in order to know how to split, the smart contract expects bytes and uint[]

        //calldata = 0x0bc664ce050a73845a7998f8dc81561ec9034b91d9c7e4295e50f755e50dcf16041223064
        //e976b678b173972eae6a73df5e47684d8e305182c5abb537bd8f1bd0a87cbaf4bc99632c3cfaac3e8db1e6
        //7717c6ec78e1bd75986f95525e60b8277061f92630ced1c103e4c7b69d416bca73b8c467fd2bfcddae4f3e
        //47dffeaaced0e622a374da090ac2bd8f1cc7ecadd479169ff4cd40ff731c8c572c74b8cdd6e0b67b5cdf78
        //6ba98c2178c52d073fd22031161c36b00533f2f113a62b6fa06ac2e198a325ebc6c437c74b27f51ff6f0231
        //d783d89fd2936da7e153ec8e1be3d11f134167b1471dc01cf9fbe537cdfff2c797478581c9019501078cf80
        //1e8a12811c74031e432b41f774a1db75f24cf2b07ae7d6205a617f1532405231fa02c7b0c0f5416cb2fb95d
        //bfc453e5c55b4b92b2c6d738120d2413e087b6760edd070625f71acc90f929313462a1868fffb11cbfbd700
        //d7c832b039650b8f3899046bd0af05aec3c06f324ee6a95e99081d6725c213d58716cedbc4b609cda798375
        //791d86d87dce725890a9e8d044e7051e3d788e81ee9ab5f7cba878a18044910c2921417a3f6b8de17e68154
        //d88af724b6864d1a5b12c87bcc2ee8d0743dbbb11ee07ff463cd157d9c92cf46224a152bb8541b005550425
        //ea28fccf71950102fc6d209b552fe392ae32c1fb8d3227011ea30ea24303895d8b288a9d7f7216b8296107c
        //dd327c0429c2c69615a6523cd845d839801f6ddc48086bfd2821edf9396780ea7025bfce6dae50d18801dde
        //3d31fbcd14e5eb7dca5bf40f1f95d0e3f13a7101eb4e11e78de149a97364fdcbbd593e7ee1777e6a826b3a7
        //4b6d8d843861e9e29f72e4e6d40b231d996050761eeeea184250cd69a3a31f56be3d0eb71f7044e2da40b42
        //b92bf5ffffc0f46a4cb7e7d2b6727672df2cc6627592da3a2f8da83c0487fa28b764759ec55698ea2313a46
        //58bfcd5c6d3d1734c8b0685a31ffd9f4f029771ac9abaf6bcc27b19a9e3f6aa3bca63325f35173934da4e89
        //4f7f3373251c5511d3fc6f5da2a7a2b22385645636c425fb460c75001fb46fada1c9805d440c37cdb9814f4
        //4d458ea4ff9efa148a2db1ee3f15667bd24f687c5b4030110d6,
        //["0x0000000000000000000000000000000000000000000000000000000000000006"]

        //so here likely everything before the comma is the bytes and the number (output) is the uint[]
        //so we just split on the comma 

        //break apart the first 
        bytesforinput = calldata.split(',')[0];
        console.log('bytesforinput =',bytesforinput);

        uintarrayforinput = JSON.parse(calldata.split(',')[1]); 
        console.log('uintarrayforinput =',uintarrayforinput);

        

        expect( await verifier.verifyProof(bytesforinput, uintarrayforinput)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        //2 character change of a calldata to get the correct length, should fail due to change though
        let a = '0x025d4f4913b362fd866d76d03cbb6cca5b00d0830505864b2b8c630689d875951df7341edb9aa507443b03521a13f3147c0ef7e7db394ffbf1f4e691d3c690621a03ae24839963bac379ba4b030011d9070ba5449a1aab853ec8c5e4945cb9581dad0f6540fddd9dd3edb277192f8a615b6b315443f987a6ffa69f74138e407c023ffa68257e2037d7bccd1edc16fa6d293fed8b41fc28fdf34aff822c45dd272479ab102f20f36ee30f7d2feffd059ed03a4fc746bd80f626e33c80cf518af825ea1be6a874a77905ac61e2dd78962fcaf739b59351b1a97c6a283101806a9709d1dd5eb1ee63cb1bfe3c92e25e6ecc095f0a690a8e681ee40368ab1c6da4960f70d82887ea169a1cf5015a5cc249a1723bd10ed8018b56ce3987a2bfd673b401904e2d54f96eadcb2c9a9e0e5578f14a49be579f990844f96e1f6a5058ead01cd63b1dad136d222da71218ae9ace3afe07e6cf01edffa6776b7d14ebb6aeb00c6032e4fa39788f1cd85824aa469a59ce83c8aa9a73a581009b2551535e8bc013af3b9ae999ba8eb9aadaf721e199fa5f7c140c89ec2c17c5f9657d8394fc18232bcf727df91624aa5a69ba6d8bce6f23c67bdf5205986362ac9663406ceefa15b250b21f1c2ddebac4cf8bafc79e1f31cac718daa2770d4d983118dcb6cc580a63f07f8e0be1b700532a3b6e8361b7caa5ec5e60b7cb554bcd9035e7e2d65a0314d4f8406299a458cb19555e69886f03e043b8c6524d7da9ab4ba2c29548d11a43d87f6ba073b0dd07324fa53c06fb2feb7e49dbd4c586c3f9e6e29c094a35131fe0f98ddd5e0a573c36f5a0a367b3c36dd44cd2ad44e22e808e4be8ea22212981a42cab47565031db90c58bb828f79b2d09b8caed9056926263d477f9cea706f34cd85827f21b50b54e19d4f8cf08ddb0c915aa8d325607269ed207a8c4eb1dc0204da673c700c4ff7a2c7c38ad040362d3f82418f218ac387ead8605a52609c633bd73f3b945e5cb241dc1f9379f5368168fc2015e7e7cf50e6ee132df7d0e882d90073cdeb13a97689019a754e11c9bf07de68e319ce8dd5af4e175c1e12bf9b09daafe3b985a88fb21ba724dd1235ae454f0062bde2ac3e9f85a51dcd7';
        let b = ['0'];
        expect( await verifier.verifyProof(a, b)).to.be.false;

    });
});