import color from './complementary-color';
import * as tf from '@tensorflow/tfjs';
import * as mt from './model-trainer';

export class MLExercise01 {

  private readonly model: tf.Model;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement){
    this.root = root;

    const input: tf.SymbolicTensor = tf.input({shape: [3]});

    const denseLayer1 = tf.layers.dense({units: 64, activation: 'relu'}).apply(input);
    const denseLayer2 = tf.layers.dense({units: 32, activation: 'relu'}).apply(denseLayer1);
    const denseLayer3 = tf.layers.dense({units: 16, activation: 'relu'}).apply(denseLayer2);
    const output: tf.SymbolicTensor =
      tf.layers.dense({units: 3}).apply(denseLayer3) as tf.SymbolicTensor;

    this.model = tf.model({inputs: input, outputs: output});
    this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd', metrics: ['accuracy']});

  }

  // Create training data set
  private data(i: number):[number[],number[]] {
    let rgbColor = color.random();
    let complementary = color.computeComplementary(rgbColor);
    return [ color.normalize(rgbColor), color.normalize(complementary)];
  };

  async start() {

    mt.train({
      model: this.model,
      data: this.data,
      totalSize: 1e4,
      sessionSize: 1000,
      batchSize: 50,
      currentStep: 0,
      visualizer: new mt.TrainingVisualizer(this.root)
    });
  }

  async stop(){}

}