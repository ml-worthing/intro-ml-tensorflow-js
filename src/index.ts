import * as kebabCase from 'lodash/fp/kebabCase';
import { MyApp } from './components/layout/app';
import { MyStyles } from './components/styles';
import { Sheet01 } from './components/sheet01/sheet01';

// add custom elements here
const elements = {
    MyApp, MyStyles, Sheet01
};

// register all components as kebab case
Object.keys(elements)
    .forEach(key => {
        customElements.define(kebabCase(key), elements[key])
    });
