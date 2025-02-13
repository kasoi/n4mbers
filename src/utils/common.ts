export const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const oneHotCache: Record<number, number[]> = {};

export const toOneHot = (label: number): number[] => {
  if (!(label in oneHotCache)) {
    const oneHot = new Array(10).fill(0);
    oneHot[label] = 1;
    oneHotCache[label] = oneHot;
  }
  return oneHotCache[label];
};