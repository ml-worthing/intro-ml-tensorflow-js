import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import '@polymer/paper-button/paper-button';
import { MLExercise01 } from '../../ml-exercise-01';
import { MLExercise02 } from '../../ml-exercise-02';
import '../chart/loss-accuracy';

export class Sheet01 extends PolymerElement {

    static get template() { return html`
      <style>
        paper-button.blue {
          background: white;
          color: var(--app-primary-color);
          margin: 0.2rem;
          font-size: 0.8em;
        }
      </style>
      <div style="padding: 0 2rem;">
          <h1>[[title]]</h1>
          <div>
            <paper-button raised class="blue" on-click="start01">Train Complementary Color</paper-button>
            <paper-button raised class="blue" on-click="start02">Train Pawel's problem</paper-button>
          </div>
          <div class="box" id="output" style="padding: 2rem 0;"></div>
          <loss-accuracy-chart id="loss" width="900" height="500"/>
      </div>
    `;
    }

    static get properties() {
      return {
          title: {
              type: String,
              value: "Exercises"
          }
      };
    }

    ready(){
        super.ready();
        this.outputElement = this.root.getElementById('output');
        this.lossAccuracyChart = this.root.getElementById('loss');
        this.exercise01 = new MLExercise01(this.outputElement);
        this.exercise02 = new MLExercise02(this.outputElement);
    }

    start01() {
        this.outputElement.innerHTML = null;
        //this.exercise01.start()
        console.log(this.lossAccuracyChart.datasource);
        this.lossAccuracyChart.next();
    }

    start02() {
        this.outputElement.innerHTML = null;
        this.exercise02.start()
    }

}