import { convertDetailed, type DmnModel } from '@pmml-to-dmn/core';
import DmnJS from 'dmn-js/lib/Viewer';
import { unaryTest } from 'feelin';
import { SAMPLE_PMML } from './sample';

import './styles.css';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';

const NUMERIC_TYPES = new Set(['integer', 'long', 'double', 'decimal', 'number']);

let viewer: DmnJS | undefined;
let currentModel: DmnModel | undefined;

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') el.className = value;
    else el.setAttribute(key, value);
  }
  el.append(...children);
  return el;
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function render(): void {
  const app = byId('app');
  const convertBtn = h('button', {}, 'Convert');
  const exampleBtn = h('button', { class: 'secondary' }, 'Load example');
  const downloadBtn = h('button', { class: 'secondary' }, 'Download .dmn');
  const copyBtn = h('button', { class: 'secondary' }, 'Copy');
  const simulateBtn = h('button', {}, 'Simulate');

  convertBtn.onclick = () => void runConversion();
  exampleBtn.onclick = () => {
    byId<HTMLTextAreaElement>('pmml').value = SAMPLE_PMML;
    void runConversion();
  };
  downloadBtn.onclick = download;
  copyBtn.onclick = copy;
  simulateBtn.onclick = runSimulation;

  app.append(
    h(
      'div',
      { class: 'wrap' },
      h(
        'header',
        {},
        h('h1', {}, 'PMML → DMN Converter'),
        h(
          'p',
          {},
          'Convert a PMML decision-tree model into a DMN decision table — entirely in your browser.',
        ),
      ),
      h(
        'div',
        { class: 'grid' },
        h(
          'div',
          { class: 'panel' },
          h('h2', {}, 'PMML input'),
          h('textarea', { id: 'pmml' }, SAMPLE_PMML),
          h('div', { class: 'toolbar' }, convertBtn, exampleBtn),
          h('p', { class: 'error', id: 'error' }),
        ),
        h(
          'div',
          { class: 'panel' },
          h('h2', {}, 'Generated DMN'),
          h('pre', { id: 'dmn-output' }),
          h('div', { class: 'toolbar' }, downloadBtn, copyBtn),
        ),
      ),
      h('div', { class: 'panel' }, h('h2', {}, 'DMN preview'), h('div', { id: 'dmn-canvas' })),
      h(
        'div',
        { class: 'panel' },
        h('h2', {}, 'Simulate'),
        h('div', { id: 'sim-inputs' }),
        h('div', { class: 'toolbar' }, simulateBtn),
        h('div', { id: 'sim-result' }),
      ),
    ),
  );
}

async function runConversion(): Promise<void> {
  const pmml = byId<HTMLTextAreaElement>('pmml').value;
  const error = byId('error');
  try {
    const { xml, model } = await convertDetailed(pmml, {
      modelId: 'pmml-to-dmn',
      modelName: 'PMML to DMN',
      decisionId: 'decision',
      decisionName: 'Decision',
    });
    currentModel = model;
    byId('dmn-output').textContent = xml;
    error.textContent = '';
    buildSimulationInputs(model);
    byId('sim-result').textContent = '';
    await renderViewer(xml);
  } catch (err) {
    error.textContent = err instanceof Error ? err.message : String(err);
  }
}

async function renderViewer(xml: string): Promise<void> {
  const canvas = byId('dmn-canvas');
  viewer?.destroy();
  viewer = new DmnJS({ container: canvas });
  await viewer.importXML(xml);
  const views = viewer.getViews();
  const table = views.find((v) => v.type === 'decisionTable') ?? views[0];
  if (table) await viewer.open(table);
}

function buildSimulationInputs(model: DmnModel): void {
  const container = byId('sim-inputs');
  container.replaceChildren(
    ...model.decision.table.inputs.map((input, index) => {
      const field = h('input', {
        id: `sim-${index}`,
        type: NUMERIC_TYPES.has(input.typeRef) ? 'number' : 'text',
      });
      return h('label', {}, `${input.label} (${input.typeRef})`, field);
    }),
  );
}

function runSimulation(): void {
  const model = currentModel;
  const result = byId('sim-result');
  if (!model) {
    result.textContent = 'Convert a model first.';
    return;
  }

  const values = model.decision.table.inputs.map(
    (_, i) => byId<HTMLInputElement>(`sim-${i}`).value,
  );
  const match = firstMatchingRule(model, values);
  result.replaceChildren();
  if (match) {
    result.append('Result: ', h('span', { class: 'out' }, match));
  } else {
    result.append('No rule matched the given inputs.');
  }
}

function firstMatchingRule(model: DmnModel, values: readonly string[]): string | undefined {
  const inputs = model.decision.table.inputs;
  for (const rule of model.decision.table.rules) {
    const matches = rule.inputEntries.every((entry, i) => {
      if (entry.feel.trim() === '') return true;
      const column = inputs[i];
      const raw = values[i] ?? '';
      const value = column && NUMERIC_TYPES.has(column.typeRef) ? Number(raw) : raw;
      try {
        return Boolean(unaryTest(entry.feel, { '?': value }).value);
      } catch {
        return false;
      }
    });
    if (matches) return unquote(rule.outputEntry.text);
  }
  return undefined;
}

function unquote(text: string): string {
  return text.replace(/^"(.*)"$/, '$1');
}

function download(): void {
  const xml = byId('dmn-output').textContent ?? '';
  if (!xml) return;
  const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
  const anchor = h('a', { href: url, download: 'model.dmn' });
  anchor.click();
  URL.revokeObjectURL(url);
}

function copy(): void {
  const xml = byId('dmn-output').textContent ?? '';
  if (xml) void navigator.clipboard?.writeText(xml);
}

render();
void runConversion();
