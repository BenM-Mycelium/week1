pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals


template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}


template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  

   component mult1 = Multiplier2();
   //define component to store 1st multiplication
   component mult2 = Multiplier2();
   //define component to store 2nd multiplication

   // Constraints.  
   mult1.a <== a;
   //multiplication 1.a is Multiplier3.a
   mult1.b <== b;
   //multiplication 1.b is Multiplier3.b
   mult2.a <== mult1.c;
   //multiplication 2.a is output of mult1
   mult2.b <== c;
   //multiplication 2.b is Multiplier3.c
   d <== mult2.c;
   //output of Multiplier3 is mult2 output (final answer)
}

component main = Multiplier3();