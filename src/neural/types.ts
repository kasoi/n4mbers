import * as math from 'mathjs';

export interface PredictionResult {
  number: number;
  chances: number[];
}

export interface Layer {
  weights: math.Matrix,
  bias: math.Matrix,
  activation: (x: math.Matrix) => math.Matrix,
}

export interface ISample {
  image: number[];
  label: number[];
}
