pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template LessThan10() {
    signal input in;
    signal output out;

    component lt = LessThan(32); 

    //documentation in the  library for the lessThan function says;
    // N is the number of bits the input  have.
    // The MSF is the sign bit.

    //not super clear but seems that n is the number of bits n should have
    //output appears to be 0 or 1 denoting false and true (if the number is less than the input or not) 

    lt.in[0] <== in;
    lt.in[1] <== 10;

    out <== lt.out;
}