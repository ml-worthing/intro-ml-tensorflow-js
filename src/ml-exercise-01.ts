import color from './complementary-color';
import * as tf from '@tensorflow/tfjs';

export class MLExercise01 {

  private model: tf.Model;
  private visualizer: tf.Callback;

  constructor(root: HTMLElement){

    const input: tf.SymbolicTensor = tf.input({shape: [3]});

    const denseLayer1 = tf.layers.dense({units: 64, activation: 'relu'}).apply(input);
    const denseLayer2 = tf.layers.dense({units: 32, activation: 'relu'}).apply(denseLayer1);
    const denseLayer3 = tf.layers.dense({units: 16, activation: 'relu'}).apply(denseLayer2);
    const output: tf.SymbolicTensor =
      tf.layers.dense({units: 3}).apply(denseLayer3) as tf.SymbolicTensor;

    this.model = tf.model({inputs: input, outputs: output});
    this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd', metrics: ['accuracy']});

    this.visualizer = new TrainingVisualizer(root);

  }

  private static range(start, end) { return Array.from({length: end-start}, (v, k) => k + start); }

  // Create training data set
  private data(i: number):[number[],number[]] {
    let rgbColor = color.random();
    let complementary = color.computeComplementary(rgbColor);
    return [ color.normalize(rgbColor), color.normalize(complementary)];
  };

  async start() {
    // Create training data set
    const totalSize = 1e4;
    const sessionSize = 1000;
    const batchSize = 50;

    this.train({
      data: this.data,
      totalSize: 1e4,
      sessionSize: 1000,
      batchSize: 50,
      currentStep: 0
    });
  }

  private async train(task: TrainingTask){
    // Kick off training.
    //for (let step = 0; step < task.totalSize; step = step + task.sessionSize) {

      let size = Math.min(task.sessionSize, task.totalSize - task.currentStep);
      console.log(task.currentStep, size, task.currentStep/task.sessionSize);
      if(size<=0) return;

      let inputs = new Array(size);
      let targets = new Array(size);

      MLExercise01.range(0,size)
        .forEach((i) => {
            const d = this.data(task.currentStep + i);
            inputs[i] = d[0];
            targets[i] = d[1];
          }
        );

      let xs = tf.tensor2d(inputs);
      let ys = tf.tensor2d(targets);

      await this.model.fit(xs, ys, {
        batchSize: task.batchSize,
        epochs: 1,
        initialEpoch: Math.floor(task.currentStep/task.sessionSize),
        callbacks: this.visualizer
      });

      tf.nextFrame().then(() => {
        task.currentStep = task.currentStep + size;
        this.train(task);
      });
    //}
  }

  async stop(){}

}

class TrainingTask {
  data: (i:number) => [number[],number[]];
  totalSize: number;
  sessionSize: number;
  batchSize: number;
  currentStep: number;
}

class TrainingVisualizer extends tf.Callback {

  validationData: tf.Tensor | tf.Tensor[];
  model: tf.Model;
  params: any;

  setParams(params: any): void {}

  setModel(model: tf.Model): void {
    this.model = model;
  }

  private root: HTMLElement;

  constructor(root: HTMLElement){
    super();
    this.root = root;
  }

  log(...msg:any[]) {
    let entry = this.root.ownerDocument.createElement("div");
    entry.className = "log-entry";
    entry.innerText = msg.join(" ");
    this.root.appendChild(entry);
  }

  async onTrainBegin(logs?: tf.Logs){}
  async onTrainEnd(logs?: tf.Logs){}
  async onEpochBegin(epoch: number, logs?: tf.Logs){}
  async onEpochEnd(epoch: number, logs?: tf.Logs){
    this.log(`after ${epoch} epochs cost is ${this.lossOf(logs)}`)
  }
  async onBatchBegin(batch: number, logs?: tf.Logs){}
  async onBatchEnd(batch: number, logs?: tf.Logs){}

  private lossOf(l:tf.Logs):number {
    return ((l["loss"] as any).mean() as tf.Tensor1D).asScalar().get();
  }

}