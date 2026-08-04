import DmnSimulationModule from '@emaarco/dmn-js-simulation';
import { convertDetailed, type DmnModel } from '@pmml-to-dmn/core';
import DmnViewer from 'dmn-js/lib/Viewer';
import { SAMPLE_PMML } from './sample';

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

const GITHUB_URL = 'https://github.com/emaarco/pmml-to-dmn';
const LINKEDIN_URL = 'https://www.linkedin.com/in/schaeckm';
const UPLOAD_SVG =
  '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>';
const GITHUB_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0C18.14 4.18 19 4.45 19 4.45c.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>';
const LINKEDIN_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

let viewer: DmnViewer | undefined;
let currentXml = '';
let currentName = 'model';
let currentModel: DmnModel | undefined;
let hasModel = false;
let step = 1;

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

/** Strip a `.pmml`/`.xml` extension for display. */
function baseName(fileName: string): string {
  return fileName.replace(/\.(pmml|xml)$/i, '');
}

function svgSpan(className: string, svg: string): HTMLSpanElement {
  const span = h('span', { class: className });
  span.innerHTML = svg;
  return span;
}

// ---------------------------------------------------------------------------
// App shell — built once; the two steps toggle visibility.
// ---------------------------------------------------------------------------

function renderApp(): void {
  const app = byId('app');

  // Step 1 — upload -------------------------------------------------------
  const fileInput = h('input', {
    id: 'file-input',
    type: 'file',
    accept: '.pmml,.xml,application/xml,text/xml',
    hidden: '',
  });
  fileInput.onchange = () => {
    const file = fileInput.files?.[0];
    if (file) void loadFile(file);
  };

  const dropzone = h(
    'button',
    { type: 'button', class: 'dropzone', id: 'dropzone' },
    svgSpan('dropzone-icon', UPLOAD_SVG),
    h('div', { class: 'dropzone-title' }, 'Drop a PMML file here'),
    h('div', { class: 'dropzone-hint' }, 'or click to browse'),
  );
  dropzone.onclick = () => fileInput.click();
  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragging');
    const file = event.dataTransfer?.files?.[0];
    if (file) void loadFile(file);
  });

  const exampleBtn = h('button', { type: 'button', class: 'link-btn' }, 'try the example model');
  exampleBtn.onclick = () => void convertAndOpen(SAMPLE_PMML, 'credit-score.pmml');

  // Step 2 — simulate -----------------------------------------------------
  const canvas = h('div', { id: 'dmn-canvas' });
  const skeleton = h(
    'div',
    { class: 'skeleton', id: 'skeleton' },
    h(
      'div',
      { class: 'skeleton-caption' },
      h('span', { class: 'spinner' }),
      h('span', { id: 'skeleton-text' }, 'Transforming…'),
    ),
    h(
      'div',
      { class: 'skeleton-table' },
      h('div', { class: 'skeleton-row skeleton-head' }),
      h('div', { class: 'skeleton-row' }),
      h('div', { class: 'skeleton-row' }),
      h('div', { class: 'skeleton-row' }),
    ),
  );

  const backBtn = h('button', { type: 'button', class: 'secondary' }, '← Upload another');
  backBtn.onclick = convertAnother;
  const copyBtn = h('button', { type: 'button', class: 'secondary' }, 'Copy XML');
  copyBtn.onclick = copyXml;
  const downloadBtn = h('button', { type: 'button' }, 'Download .dmn');
  downloadBtn.onclick = () => void download();

  app.replaceChildren(
    h(
      'main',
      { class: 'appmain' },
      h('div', { class: 'brand' }, 'PMML ', h('span', { class: 'g' }, '→'), ' DMN'),
      buildStepper(),
      h(
        'div',
        { class: 'wstage' },
        // Step 1
        h(
          'section',
          { class: 'wpage on', id: 'step-1' },
          h(
            'div',
            { class: 'panel narrow' },
            h('h1', {}, 'Upload a PMML model'),
            h(
              'p',
              { class: 'lead' },
              'A decision-tree PMML file. Everything runs locally in your browser — nothing is uploaded.',
            ),
            fileInput,
            dropzone,
            h('p', { class: 'error', id: 'upload-error' }),
            h('div', { class: 'or' }, 'or ', exampleBtn),
          ),
        ),
        // Step 2
        h(
          'section',
          { class: 'wpage', id: 'step-2' },
          h(
            'div',
            { class: 'resultbar' },
            h('span', { class: 'model-name', id: 'model-name' }, 'model'),
            h('span', { class: 'result-meta', id: 'result-meta' }, ''),
          ),
          h('div', { class: 'canvas-wrap' }, canvas, skeleton),
          h(
            'div',
            { class: 'wnav' },
            backBtn,
            h('span', { class: 'wspacer' }),
            copyBtn,
            downloadBtn,
          ),
        ),
      ),
    ),
    buildFooter(),
  );
  updateStepper();
}

function buildStepper(): HTMLElement {
  const mk = (n: number, label: string): HTMLElement => {
    const el = h(
      'div',
      { class: 'step', id: `stp-${n}` },
      h('span', { class: 'num' }, String(n)),
      h('span', { class: 'lbl' }, label),
    );
    el.onclick = () => goStep(n);
    return el;
  };
  return h(
    'div',
    { class: 'stepper' },
    mk(1, 'Upload'),
    h('div', { class: 'bar', id: 'bar-1' }),
    mk(2, 'Simulate'),
  );
}

function buildFooter(): HTMLElement {
  const social = (href: string, label: string, icon: string): HTMLAnchorElement => {
    const a = h('a', {
      class: 'footer-social',
      href,
      target: '_blank',
      rel: 'noopener',
      'aria-label': label,
    });
    a.innerHTML = icon;
    return a;
  };
  return h(
    'footer',
    { class: 'app-legal' },
    h(
      'span',
      { class: 'footer-credit' },
      'Created with ',
      h('span', { class: 'heart' }, '♥'),
      ' by ',
      h('a', { href: LINKEDIN_URL, target: '_blank', rel: 'noopener' }, 'Marco Schäck'),
    ),
    h('span', { class: 'app-spacer' }),
    social(GITHUB_URL, 'GitHub', GITHUB_ICON),
    social(LINKEDIN_URL, 'LinkedIn', LINKEDIN_ICON),
  );
}

function updateStepper(): void {
  for (const n of [1, 2]) {
    const el = byId(`stp-${n}`);
    el.classList.toggle('active', n === step);
    el.classList.toggle('done', n < step);
    el.classList.toggle('disabled', n === 2 && !hasModel);
  }
  byId('bar-1').classList.toggle('done', step > 1 && hasModel);
}

function goStep(n: number): void {
  if (n === 2 && !hasModel) return;
  step = n;
  for (const i of [1, 2]) byId(`step-${i}`).classList.toggle('on', i === n);
  updateStepper();
  window.scrollTo({ top: 0 });
}

// ---------------------------------------------------------------------------
// Conversion + read-only viewer
// ---------------------------------------------------------------------------

async function loadFile(file: File): Promise<void> {
  const text = await file.text();
  await convertAndOpen(text, file.name);
}

async function convertAndOpen(pmml: string, sourceName: string): Promise<void> {
  currentName = baseName(sourceName);
  byId('upload-error').textContent = '';
  hasModel = true;
  goStep(2);
  showSkeleton();
  const startedAt = performance.now();
  try {
    const { xml, model } = await convertDetailed(pmml, {
      modelId: 'pmml-to-dmn',
      modelName: currentName,
      decisionId: 'decision',
      decisionName: 'Decision',
    });
    currentXml = xml;
    currentModel = model;
    await mountViewer();
    fillMeta();
    // Hold the skeleton a beat so the transition never flashes on small models
    // while still bridging the real wait on larger ones.
    await ensureMinDelay(startedAt, 500);
    revealViewer();
  } catch (err) {
    teardownViewer();
    hasModel = false;
    currentXml = '';
    currentModel = undefined;
    goStep(1);
    byId('upload-error').textContent = err instanceof Error ? err.message : String(err);
  }
}

function showSkeleton(): void {
  byId('skeleton-text').textContent = `Transforming ${currentName}…`;
  // Hide the canvas (not display:none — dmn-js still needs to measure) so its
  // content never paints through the loading skeleton.
  byId('dmn-canvas').classList.add('is-loading');
  byId('skeleton').classList.remove('hidden');
}

function revealViewer(): void {
  byId('dmn-canvas').classList.remove('is-loading');
  byId('skeleton').classList.add('hidden');
}

async function mountViewer(): Promise<void> {
  const canvas = byId('dmn-canvas');
  teardownViewer();
  // Read-only Viewer: the decision table renders and simulates, but cannot be
  // edited. The simulation module supplies the interactive input controls.
  viewer = new DmnViewer({
    container: canvas,
    decisionTable: { additionalModules: [DmnSimulationModule.decisionTable] },
  });
  await viewer.importXML(currentXml);
  const views = viewer.getViews();
  const table = views.find((view) => view.type === 'decisionTable') ?? views[0];
  if (table) await viewer.open(table);
}

function teardownViewer(): void {
  viewer?.destroy();
  viewer = undefined;
}

function fillMeta(): void {
  byId('model-name').textContent = currentName;
  const table = currentModel?.decision.table;
  const rules = table?.rules.length ?? 0;
  const inputs = table?.inputs.length ?? 0;
  byId('result-meta').textContent =
    `${rules} rule${rules === 1 ? '' : 's'} · ${inputs} input${inputs === 1 ? '' : 's'} · DMN 1.3`;
}

// ---------------------------------------------------------------------------
// Export actions (inline on the result view — no separate step)
// ---------------------------------------------------------------------------

function download(): void {
  if (!currentXml) return;
  const url = URL.createObjectURL(new Blob([currentXml], { type: 'application/xml' }));
  const anchor = h('a', { href: url, download: `${currentName}.dmn` });
  anchor.click();
  URL.revokeObjectURL(url);
}

function copyXml(): void {
  if (currentXml) void navigator.clipboard?.writeText(currentXml);
}

function convertAnother(): void {
  teardownViewer();
  hasModel = false;
  currentXml = '';
  currentModel = undefined;
  byId('upload-error').textContent = '';
  byId<HTMLInputElement>('file-input').value = '';
  goStep(1);
}

function ensureMinDelay(startedAt: number, minMs: number): Promise<void> {
  const remaining = minMs - (performance.now() - startedAt);
  return remaining > 0
    ? new Promise((resolve) => setTimeout(resolve, remaining))
    : Promise.resolve();
}

renderApp();
