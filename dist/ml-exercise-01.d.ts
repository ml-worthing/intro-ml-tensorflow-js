export declare class MLExercise01 {
    private model;
    private visualizer;
    constructor(root: HTMLElement);
    private static range(start, end);
    private data(i);
    start(): Promise<void>;
    private train(task);
    stop(): Promise<void>;
}
