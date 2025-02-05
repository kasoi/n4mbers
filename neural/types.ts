import * as math from 'mathjs';

export interface PredictionResult {
  number: number;
  chances: number[];
}

export interface Weights {
  weights_input_hidden: number[][];
  weights_hidden_output: number[][];
  bias_input_hidden: Array<number>;
  bias_hidden_output: Array<number>;
}

export interface MathWeights {
  weights_input_hidden: math.Matrix;
  weights_hidden_output: math.Matrix;
  bias_input_hidden: math.Matrix;
  bias_hidden_output: math.Matrix;
}

export interface ISample {
  image: number[];
  label: number[];
}
