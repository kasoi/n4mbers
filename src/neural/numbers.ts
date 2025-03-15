/* eslint-disable @typescript-eslint/no-unused-vars */
import { Layer, PredictionResult } from './types';
import * as math from 'mathjs';

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

const activateSigmoid = (x: math.Matrix): math.Matrix => {
  return math.map(x, sigmoid) as math.Matrix;
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

// const onehotPercents = (mat: math.Matrix) : number[] => {
//   const arr: number[] = [];
//   mat.forEach((a) => {
//     arr.push(toNearest(a, 0.01));
//   })

//   return arr;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initLayers = (jsonData: any): Layer[] => {
  // const value = fs.readFileSync('weights.json', "utf8");
  
  console.log('json data', jsonData);
  const layers = [];
  for (let i = 0; i < jsonData.length; i++) {
    const layer = jsonData[i];
    const weights = math.matrix(layer.weights);
    const bias = math.matrix(layer.bias);
    const activation = activateSigmoid;

    layers.push({
      weights,
      bias,
      activation,
    });
  }

  return layers;
}

export const forwardPass = (layers: Layer[], image: number[]): math.Matrix[] => {
  const activations = [math.reshape(math.matrix(image), [784, 1])];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const mult = math.multiply(layer.weights, activations[i]);
    const pre = math.add(layer.bias, mult);
    const activation = layer.activation(pre);
    activations.push(activation);
  }

  return activations;
}

export const predictNumber = (layers: Layer[], image: number[]): PredictionResult => {
  const activations = forwardPass(layers, image);
  
  const result = activations[activations.length - 1];
  
  const output: PredictionResult = {
    number: getMaxIndex(result),
    chances: result.toArray().flat() as number[],
  };
  
  return output;
}
