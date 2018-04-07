import * as ml from './ml-model';
import color from './complementary-color';

export class MLExercise01 {

  private model: ml.Model;

  constructor(root: HTMLElement){
    // Create learning model
    this.model = new ml.Model({
      "math": ml.ModelMath.ENV,
      "inputShape": [3],
      "layers": [
        new ml.FullyConnectedLayer(64, ml.LayerActivation.RELU),
        new ml.FullyConnectedLayer(32, ml.LayerActivation.RELU),
        new ml.FullyConnectedLayer(16, ml.LayerActivation.RELU)
      ],
      "outputSize": 3,
      "optimizer": ml.ModelOptimizer.SGD,
      "learningRate": 0.01,
      "batchSize": 50,
      "localStepsToRun": 100,
      "listener": new TrainingVisualizer(root),
    });
  }

  // Create training data set
  private trainingDataGenerator = (i: number) => {
    let rgbColor = color.random();
    let complementary = color.computeComplementary(rgbColor);
    return [ color.normalize(rgbColor), color.normalize(complementary)] as ml.TrainingData;
  };

  async start() {
    // Kick off training.
    this.model.train(this.trainingDataGenerator, 1e3, 1e-3);
  }

  async stop(){
    this.model.dispose();
  }

}

class TrainingVisualizer implements ml.TrainingListener {

  root: HTMLElement;

  constructor(root: HTMLElement){
    this.root = root;
  }

  log(...msg:any[]) {
    let entry = this.root.ownerDocument.createElement("div");
    entry.className = "log-entry"
    entry.innerText = msg.join(" ");
    this.root.appendChild(entry)
  }

  async trainingStarted(config: ml.ModelConfig, maxIterations: number, maxCost: number){
    this.log(`Starting model training.
    Max iterations: ${maxIterations}, target cost: ${maxCost}, learning rate: ${config.learningRate}, batch size: ${config.batchSize}`)
  }
  async trainingOngoing(step:number, cost:number){
    this.log(`after ${step} steps cost is ${cost}`)
  }
  async trainingFinished(step:number, cost:number){
    this.trainingOngoing(step,cost);
    this.log("Training finished.");
  }
}