import * as tf from '@tensorflow/tfjs';
export declare function range(start: any, end: any): any[];
export declare function train(task: TrainingTask): Promise<void>;
export declare class TrainingTask {
    model: tf.Model;
    data: (i: number) => [number[], number[]];
    totalSize: number;
    sessionSize: number;
    batchSize: number;
    currentStep: number;
    visualizer: tf.Callback;
}
export declare class TrainingVisualizer extends tf.Callback {
    validationData: tf.Tensor | tf.Tensor[];
    model: tf.Model;
    params: any;
    setParams(params: any): void;
    setModel(model: tf.Model): void;
    private root;
    constructor(root: HTMLElement);
    log(...msg: any[]): void;
    onTrainBegin(logs?: tf.Logs): Promise<void>;
    onTrainEnd(logs?: tf.Logs): Promise<void>;
    onEpochBegin(epoch: number, logs?: tf.Logs): Promise<void>;
    onEpochEnd(epoch: number, logs?: tf.Logs): Promise<void>;
    onBatchBegin(batch: number, logs?: tf.Logs): Promise<void>;
    onBatchEnd(batch: number, logs?: tf.Logs): Promise<void>;
    private lossOf(l);
}
