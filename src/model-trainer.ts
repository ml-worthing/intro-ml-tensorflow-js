import * as tf from '@tensorflow/tfjs';


export function range(start, end) { return Array.from({length: end-start}, (v, k) => k + start); }

export async function train(task: TrainingTask){
  let size = Math.min(task.sessionSize, task.totalSize - task.currentStep);
  console.log(task.currentStep, size, task.currentStep/task.sessionSize);
  if(size<=0) return;

  let inputs = new Array(size);
  let targets = new Array(size);

  range(0,size)
    .forEach((i) => {
        const d = task.data(task.currentStep + i);
        inputs[i] = d[0];
        targets[i] = d[1];
      }
    );

  let xs = tf.tensor2d(inputs);
  let ys = tf.tensor2d(targets);

  await task.model.fit(xs, ys, {
    batchSize: task.batchSize,
    epochs: 1,
    initialEpoch: Math.floor(task.currentStep/task.sessionSize),
    callbacks: task.visualizer
  });

  tf.nextFrame().then(() => {
    task.currentStep = task.currentStep + size;
    train(task);
  });
}

export class TrainingTask {
  model: tf.Model;
  data: (i:number) => [number[],number[]];
  totalSize: number;
  sessionSize: number;
  batchSize: number;
  currentStep: number;
  visualizer: tf.Callback;
}

export class TrainingVisualizer extends tf.Callback {

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