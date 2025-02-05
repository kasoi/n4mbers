/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import { MathWeights, PredictionResult } from './types';
import { parseImages, parseLabels } from './parser';
import * as math from 'mathjs';

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

const activateSigmoid = (x: math.Matrix): math.Matrix => {
  return math.map(x, sigmoid) as math.Matrix;
}

const toNearest = (num: number, roundTo: number = 0.1): number => {
  return Math.round(num * (1 / roundTo)) / (1 / roundTo);
}

export const getMaxIndex = (mat: math.Matrix | number[]): number => {
  let arr: number[] = []
  if (Array.isArray(mat)) {
    arr = mat;
  } else {
    mat.map((v) => arr.push(v));
  }

  let maxNum = arr[0];
  arr.forEach((item) => {
    if (item > maxNum) maxNum = item;
  })

  const index = arr.indexOf(maxNum);

  return index;
}

const onehotPercents = (mat: math.Matrix) : number[] => {
  const arr: number[] = [];
  mat.forEach((a) => {
    arr.push(toNearest(a, 0.01));
  })

  return arr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initWeights = (weights: any): MathWeights => {
  // const value = fs.readFileSync('weights.json', "utf8");
  
  const mathWeights: MathWeights = {
    weights_input_hidden: math.matrix(weights.weights_input_hidden),
    weights_hidden_output: math.matrix(weights.weights_hidden_output),
    bias_hidden_output: math.matrix(weights.bias_hidden_output),
    bias_input_hidden: math.matrix(weights.bias_input_hidden)
  };

  return mathWeights;
}

export const predictNumber = (weights: MathWeights, image: number[]): PredictionResult => {
  const img = math.reshape(image, [784, 1]);
  const hiddenMult = math.multiply(weights.weights_input_hidden, img);
  const hiddenPre = math.add(weights.bias_input_hidden, hiddenMult);

  const hiddenActivation = activateSigmoid(hiddenPre);

  const outputPre = math.add(weights.bias_hidden_output, math.multiply(weights.weights_hidden_output, hiddenActivation));
  const outputActivation = activateSigmoid(outputPre);

  const result = onehotPercents(outputActivation);
  
  const output: PredictionResult = {
    number: getMaxIndex(result),
    chances: result,
  };
  
  return output;
}
