import color from './complementary-color';
import * as tf from '@tensorflow/tfjs';
import * as mt from './model-trainer';

interface MLExercise01UI {
  train: HTMLButtonElement,
  output: HTMLElement
}

export class MLExercise01 {

  private readonly model: tf.Model;
  private readonly ui: MLExercise01UI;

  constructor(root: HTMLElement){
    this.ui = this.setupUI(root);
    this.model = this.createModel();
  }

  private createModel(){
    const input: tf.SymbolicTensor = tf.input({shape: [3]});

    const denseLayer1 = tf.layers.dense({units: 64, activation: 'relu'}).apply(input);
    const denseLayer2 = tf.layers.dense({units: 32, activation: 'relu'}).apply(denseLayer1);
    const denseLayer3 = tf.layers.dense({units: 16, activation: 'relu'}).apply(denseLayer2);
    const output: tf.SymbolicTensor =
      tf.layers.dense({units: 3}).apply(denseLayer3) as tf.SymbolicTensor;

    const model = tf.model({inputs: input, outputs: output});
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd', metrics: ['accuracy']});
    return model;
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
      visualizer: new mt.TrainingVisualizer(this.ui.output)
    });
  }

  async stop(){}

  private template: string = `
      <div>
          <button id='train'>Train</button>
          <div id='output'></div>
      </div>
  `;

  private setupUI(anchor: HTMLElement){
    anchor.innerHTML = this.template;
    const train = anchor.querySelector("#train") as HTMLButtonElement;
    const output = anchor.querySelector("#output") as HTMLElement;
    train.addEventListener("click",(e: Event) => this.start());
    return {
      train: train,
      output: output
    }
  }

}