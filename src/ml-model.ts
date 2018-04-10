import * as dl from 'deeplearn';
import {NDArrayMath, Optimizer} from "deeplearn";

export const enum LayerActivation { RELU }
export const enum ModelMath { ENV }
export const enum ModelOptimizer { SGD }

export interface ModelConfig {
  math: ModelMath; // Encapsulates math operations on the CPU and GPU.
  inputShape: number[]; // The shape of the input tensor
  layers: ModelLayer[]; // Defines learning network (hidden layers)
  outputSize: number //The size of the output tensor
  optimizer: ModelOptimizer; // Learning strategy
  learningRate: number; //Learning rate for optimizer
  batchSize: number;   // Each training batch will be on this many examples.
  localStepsToRun: number; // We will only fetch the cost every n steps because doing so requires a transfer of data from the GPU.
  listener?: TrainingListener | null;
}

export interface ModelLayer {
  name: string;
  activation: LayerActivation;
  create(graph: dl.Graph, inputLayer: dl.SymbolicTensor, layerIndex: number): dl.SymbolicTensor;
}

export class FullyConnectedLayer implements ModelLayer {
  name: string;
  size: number;
  activation: LayerActivation;

  constructor(size:number, activation?: LayerActivation){
    this.size = size;
    this.activation = activation || LayerActivation.RELU;
  }

  create(graph: dl.Graph, inputLayer: dl.SymbolicTensor, layerIndex: number): dl.SymbolicTensor {
    this.name = `fully_connected_${layerIndex}`;
    return graph.layers.dense( this.name, inputLayer, this.size, this.activationFor(graph),true);
  }

  activationFor(graph: dl.Graph) {
    switch(this.activation) {
      case LayerActivation.RELU: return (x) => graph.relu(x);
    }
  }
}

export interface TrainingListener {
  log(...msg:any[]):void;
  trainingStarted(config: ModelConfig, maxIterations: number, maxCost: number):void;
  trainingOngoing(step:number, cost:number):void;
  trainingFinished(step:number, cost:number):void;
}

export type TrainingData = [number[], number[]]

const enum ModelState { IDLE, TRAINING };

export class Model {

  // Configuration
  private config: ModelConfig;

  // Runs training.
  private session: dl.Session;

  inputTensor: dl.SymbolicTensor;
  targetTensor: dl.SymbolicTensor;
  costTensor: dl.SymbolicTensor;
  predictionTensor: dl.SymbolicTensor;

  private state: ModelState = ModelState.IDLE;

  constructor(config: ModelConfig) {
    this.config = config;
    this.setupSession();
  }

  /**
   * Constructs the graph of the model. Call this method before training.
   */
  private setupSession(): void {
    const graph = new dl.Graph();

    // This tensor contains the input. In this case, it is a scalar.
    this.inputTensor = graph.placeholder('input value', this.config.inputShape);

    // This tensor contains the target.
    this.targetTensor = graph.placeholder('output value', [this.config.outputSize]);

    // Create hidden layers
    let previousTensor: dl.SymbolicTensor = this.inputTensor;
    this.config.layers.forEach((layer,index) => {
      previousTensor = layer.create(graph, previousTensor,index);
    });

    // This tensor contains the computed prediction
    this.predictionTensor =
      graph.layers.dense(
        "prediction", previousTensor, this.config.outputSize, ((x) => graph.relu(x)), true);

    // We will optimize using mean squared loss.
    this.costTensor =
      graph.meanSquaredCost(this.targetTensor, this.predictionTensor);

    let math:NDArrayMath;
    switch(this.config.math){
      case ModelMath.ENV: math = dl.ENV.math; break;
    }

    // Create the session only after constructing the graph.
    this.session = new dl.Session(graph, math);
  }

  predict(inputData: number[]): number[] {
    let predicted: number[] = [];
    dl.tidy(() => {
      const mapping = [{
        tensor: this.inputTensor,
        data: dl.tensor1d(inputData),
      }];
      const evalOutput = this.session.eval(this.predictionTensor, mapping);
      const values = evalOutput.dataSync();
      predicted = Array.prototype.slice.call(values);
    });
    return predicted;
  }

  train(data: (i:number) => TrainingData, maxIterations: number, maxCost: number) {
    this.state = ModelState.TRAINING;
    this.config.listener.trainingStarted(this.config,maxIterations,maxCost);
    const feedEntries = this.prepareFeed(data, maxIterations*this.config.batchSize);
    // Initial cost calculation
    let cost = this.train1Batch(true, feedEntries, dl.train.sgd(this.config.learningRate), 1);
    this.config.listener.trainingOngoing(0, cost);
    // Schedule the training.
    requestAnimationFrame(this.trainLocal.bind(this, feedEntries, maxIterations, maxCost, 0));
    this.state = ModelState.IDLE;
  }

  private trainLocal(feedEntries: dl.FeedEntry[], maxIterations: number, maxCost: number, steps: number) {

    const learningRate =
      this.config.learningRate * Math.pow(0.85, Math.floor(steps / this.config.localStepsToRun));

    let optimizer: Optimizer;
    switch(this.config.optimizer){
      case ModelOptimizer.SGD: optimizer = dl.train.sgd(learningRate);break;
    }

    let step = steps;

    for (let i = 0; i < this.config.localStepsToRun - 1; i++) {
      this.train1Batch(false, feedEntries, optimizer, this.config.batchSize);
      step++;

      if(this.aboutToDispose) {
        this.aboutToDispose();
        this.aboutToDispose = null;
        this.config.listener.log("Training has been interrupted.");
        return;
      }
    }

    let cost = this.train1Batch(true, feedEntries, optimizer, this.config.batchSize);
    step++;

    if (step < maxIterations && cost > maxCost) {
      this.config.listener.trainingOngoing(step, cost);
      // Schedule the next batch to be trained.
      requestAnimationFrame(this.trainLocal.bind(this,feedEntries, maxIterations, maxCost, step));
    } else {
      this.config.listener.trainingFinished(step, cost);
    }

  }

  /**
   * Trains one batch for one iteration. Call this method multiple times to
   * progressively train. Calling this function transfers data from the GPU in
   * order to obtain the current loss on training data.
   *
   * If shouldFetchCost is true, returns the mean cost across examples in the
   * batch. Otherwise, returns -1. We should only retrieve the cost now and then
   * because doing so requires transferring data from the GPU.
   */
  private train1Batch(shouldFetchCost: boolean, feedEntries: dl.FeedEntry[], optimizer: Optimizer, batchSize: number): number {
    // Train 1 batch.
    let costValue = -1;
    dl.tidy(() => {
      const cost = this.session.train(
        this.costTensor, feedEntries, batchSize, optimizer,
        shouldFetchCost ? dl.CostReduction.MEAN : dl.CostReduction.NONE);

      if (!shouldFetchCost) {
        // We only train. We do not compute the cost.
        return;
      }

      // Compute the cost (by calling get), which requires transferring data
      // from the GPU.
      costValue = cost.get();
    });
    return costValue;
  }

  private range(end) { return Array.from({length: end}, (v, k) => k); }

  /**
   * Prepares data used to train. Creates a feed entry that will later be used
   * to pass data into the model.
   */
  private prepareFeed(data: (i:number) => TrainingData, size:number): dl.FeedEntry[] {

    const inputs = new Array(size);
    const targets = new Array(size);

    this.range(size).forEach((i) => {
      const d = data(i);
      inputs[i] = dl.tensor1d(d[0]);
      targets[i] = dl.tensor1d(d[1]);
    });

    // This provider will shuffle the training data (and will do so in a way
    // that does not separate the input-target relationship).
    const shuffledInputProviderBuilder = new dl.InCPUMemoryShuffledInputProviderBuilder(
      [inputs, targets]);
    const [inputProvider, targetProvider] =
      shuffledInputProviderBuilder.getInputProviders();

    // Maps tensors to InputProviders.
    return [
      {tensor: this.inputTensor, data: inputProvider},
      {tensor: this.targetTensor, data: targetProvider}
    ];
  }

  private aboutToDispose: () => void | null;

  dispose(){
    if(this.state == ModelState.TRAINING)
    this.aboutToDispose = () => this.session.dispose();
  }

}