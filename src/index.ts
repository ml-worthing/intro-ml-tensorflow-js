import * as kebabCase from 'lodash/fp/kebabCase';
import { MyApp } from './components/layout/app';
import { MyStyles } from './components/styles';
import { Sheet01 } from './components/sheet/sheet01';
import { LossAccuracyChart } from './components/chart/loss-accuracy';

// add custom elements here
const elements = {
    MyApp, MyStyles, Sheet01, LossAccuracyChart
};

// register all components as kebab case
Object.keys(elements)
    .forEach(key => {
        customElements.define(kebabCase(key), elements[key])
    });
