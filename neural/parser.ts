import fs from "fs/promises"

export const parseImages = async (path: string): Promise<Array<number[]>> => {
  const data: Buffer = await fs.readFile(path);
  const udata = new Uint8Array(data);
  const imagesData = udata.slice(16);
  const view = new DataView(udata.buffer);

  const numImages = view.getInt32(4, false)

  const imageSize = 28 * 28;
  const images = [];

  for (let i = 0; i < numImages; i++) {
    const image = imagesData.slice(i * imageSize, (i + 1) * imageSize);
    const normalizedImage = Array.from(image).map(pixel => pixel / 255);
    images.push(normalizedImage);
  }

  return images;
}
const oneHotCache: Record<number, number[]> = {};

const toOneHot = (label: number): number[] => {
  if (!(label in oneHotCache)) {
    const oneHot = new Array(10).fill(0);
    oneHot[label] = 1;
    oneHotCache[label] = oneHot;
  }
  return oneHotCache[label];
};

export const parseLabels = async (path: string): Promise<Array<number[]>> => {
  const data: Buffer = await fs.readFile(path);
  const udata = new Uint8Array(data);
  const imagesData = udata.slice(8);
  const view = new DataView(udata.buffer);

  const numLabels = view.getInt32(4, false)

  const labels = [];

  for (let i = 0; i < numLabels; i++) {
    const label = imagesData.slice(i, i + 1);
    labels.push(toOneHot(label[0]));
  }

  return labels;
}
