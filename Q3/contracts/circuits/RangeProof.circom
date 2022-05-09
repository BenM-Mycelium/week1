pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here
    low.in[0] <== in 
    //low first input is the number we want to check is equal to or less than some number (in[1]) (so in for us)
    low.in[1] <== range[1]
    //next we input the number we want to check the input is less than (so if (input[0] <= input[1]) then it is true)
    //so for us we want to check that the input is less than our max range (or range[1])

    //same concept for these lines below just in reverse
    high.in[0] <== in
    high.in[1] <== range[0]

    //use the null rule to make an or statement (since anything multiplied by 0 is 0 both of these have to be 1 to return 1 (or true) if they are multiplied together)
    low.in <== low.out * high.out
}