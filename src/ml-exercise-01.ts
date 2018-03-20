import * as dl from 'deeplearn';

export class MLExercise01 {

    static async start(outputElement){
        const a = dl.scalar(10);
        const b = dl.scalar(20);
        const result = await a.add(b).data();
        outputElement.innerText = result.toString();
    }

}