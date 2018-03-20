import { Element as PolymerElement, html } from '@polymer/polymer/polymer-element';

export class MyStyles extends PolymerElement {

    static get template() { return html`
      <style>
        .box {
          padding: 16px;
        }
      </style>
    `;
    }
}