import { PmmlToDmnApp } from './PmmlToDmnApp';

import '@fontsource-variable/geist';
import './styles.css';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css';
import '@emaarco/dmn-js-simulation/assets/dmn-js-simulation.css';

const container = document.getElementById('app');
if (!container) throw new Error('Missing element #app');
new PmmlToDmnApp(container).mount();
