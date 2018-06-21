import * as tf from '@tensorflow/tfjs';
import * as mt from './model-trainer';

export class MLExercise02 {

  private readonly model: tf.Model;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement){
    this.root = root;

    const input: tf.SymbolicTensor = tf.input({shape: [1]});

    const denseLayer1 = tf.layers.dense({units: 1, activation: 'softsign'}).apply(input);
    const output: tf.SymbolicTensor =
      tf.layers.dense({units: 1}).apply(denseLayer1) as tf.SymbolicTensor;

    const learningRate = 0.01;
    const optimizer = tf.train.sgd(learningRate);

    this.model = tf.model({inputs: input, outputs: output});
    this.model.compile({loss: 'meanSquaredError', optimizer: optimizer, metrics: ['accuracy']});

  }

  // Create training data set
  private data(i: number):[number[],number[]] {
    let x = i-1000;
    let y = x<10?0:1;
    return [ [x], [y] ];
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