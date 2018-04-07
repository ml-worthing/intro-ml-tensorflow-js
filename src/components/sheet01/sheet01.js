import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { MLExercise01 } from '../../ml-exercise-01';

export class Sheet01 extends PolymerElement {

    static get template() { return html`
      <div style="padding: 2rem;">
          <div>
            <button on-click="start">Train</button>
            <button on-click="stop">Dispose</button>
          </div>
          <div class="box" id="output-ml-01" style="padding: 2rem 0;">
          </div>
      </div>
    `;
    }

    static get properties() {
      return {

      };
    }

    ready(){
        super.ready();
        let outputElement = this.root.getElementById('output-ml-01');
        outputElement.innerHTML = null;
        this.exercise = new MLExercise01(outputElement);
    }

    start() {
        this.exercise.start();
    }

    stop() {
        this.exercise.stop();
    }
}