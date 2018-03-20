import { Element as PolymerElement, html } from '@polymer/polymer/polymer-element';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';

export class MyApp extends PolymerElement {

    static get template() { return html`
    <style>
      :host {
        display: block;
      }

      app-header {
        color: white;
        background-color: var(--app-primary-color);
      }

      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }

      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }

      app-drawer {
        --app-drawer-content-container: {
          background-color: var(--app-drawer-background-color);
        }
      }

      .drawer-list {
        margin: 0 20px;
      }

      .drawer-list a {
        display: block;
        padding: 0 16px;
        text-decoration: none;
        color: var(--app-secondary-color);
        line-height: 40px;
      }

      .drawer-list a.iron-selected {
        color: black;
        font-weight: bold;
      }
    </style>

    <!-- app-location binds to the app's URL -->
    <app-location use-hash-as-path route="{{route}}"></app-location>

    <!-- this app-route manages the top-level routes -->
    <app-route
        route="{{route}}"
        pattern="/exercise/:exercise"
        data="{{routeData}}"
        tail="{{subroute}}"></app-route>

    <app-drawer-layout fullbleed>
      <app-drawer slot="drawer">
        <iron-selector selected="{{routeData.sheet}}" attr-for-selected="name" class="drawer-list" role="navigation">
          <a name="01" href="#/exercise/01">Exercise 01</a>
        </iron-selector>
        <slot name="drawercontent"></slot>
      </app-drawer>
      <app-header-layout>
        <app-header slot="header">
          <app-toolbar>
            <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
            <div main-title>[[name]]</div>
          </app-toolbar>
        </app-header>

        <slot></slot>

        <!-- iron-pages selects the view based on the active route -->
        <iron-pages selected="[[routeData.exercise]]" attr-for-selected="name">
          <sheet-01 name="01" route="{{subroute}}"></sheet-01>
        </iron-pages>

      </app-header-layout>
    </app-drawer-layout>
    `;
    }

    static get properties() {
      return {
        name: {
          type: String
        },
        route: {
          type: Object
        }
      };
    }

    ready() {
      super.ready();
    }
}