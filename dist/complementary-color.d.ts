declare const _default: {
    normalize(rgbColor: number[]): number[];
    denormalize(normalizedRgbColor: number[]): number[];
    random(): [number, number, number];
    randomChannel(): number;
    computeComplementary(rgbColor: number[]): number[];
};
export default _default;
