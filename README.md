# intro-ml-tensorflow-js
Seed of ML exercises using [Tensorflow.js](https://js.tensorflow.org/) + [Typescript](http://www.typescriptlang.org/docs/home.html) + Polymer 3.x + Webpack

Just see it
==
<https://ml-worthing.github.io/intro-ml-tensorflow-js>

Prerequisites
==
- [nvm](https://github.com/creationix/nvm) - bash script to manage multiple active node.js versions
- [yarn](https://yarnpkg.com/en/) - node dependency manager

Build
==

  - Run `yarn install` to download dependent modules
  - Run `yarn build` to compile distribution for prod
  - Run `yarn start` to hot-deploy locally for development
  - Run `yarn serve` to build prod and serve on localhost
  - Run `yarn deploy` to deploy new version on github.com

Add new exercise sheet
==

- add new `src/ml-exercise-XX.ts` file to `/src`
- add new sheet (copy `/src/components/sheet01/sheet01.js` into `/src/components/sheetXX/sheetXX.js`)
- link to the new exercise inside the new sheet
- link to the new sheet in `index.ts`
- add new entries `<a name="XX" href="#/exercise/XX">Exercise XX</a>` and `<sheet-XX name="XX" route="{{subroute}}"></sheet-XX>` in `src/components/layout/app.js`
