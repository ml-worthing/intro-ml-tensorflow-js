import { Element as PolymerElement, html } from '@polymer/polymer/polymer-element';
import { MLExercise01 } from '../../ml-exercise-01';

export class Sheet01 extends PolymerElement {

    static get template() { return html`
      <div class="box" id="output-ml-01" style="padding: 2rem;">
      </div>
    `;
    }

    static get properties() {
      return {
        
      };
    }

    ready() {
      super.ready();
      let outputElement = this.root.getElementById('output-ml-01');
      MLExercise01.start(outputElement);
    }
}