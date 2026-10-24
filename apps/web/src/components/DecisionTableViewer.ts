import DmnSimulationModule from '@emaarco/dmn-js-simulation';
import DmnViewer from 'dmn-js/lib/Viewer';
import { h } from '../utils/h';

export class DecisionTableViewer {
  readonly element: HTMLElement;
  private readonly canvas = h('div', { id: 'dmn-canvas' });
  private readonly skeletonText = h('span', {}, 'Transforming…');
  private readonly skeleton = h(
    'div',
    { class: 'skeleton' },
    h('div', { class: 'skeleton-caption' }, h('span', { class: 'spinner' }), this.skeletonText),
    h(
      'div',
      { class: 'skeleton-table' },
      h('div', { class: 'skeleton-row skeleton-head' }),
      h('div', { class: 'skeleton-row' }),
      h('div', { class: 'skeleton-row' }),
      h('div', { class: 'skeleton-row' }),
    ),
  );
  private viewer: DmnViewer | undefined;

  constructor() {
    this.element = h('div', { class: 'canvas-wrap' }, this.canvas, this.skeleton);
  }

  showLoading(modelName: string): void {
    this.skeletonText.textContent = `Transforming ${modelName}…`;
    this.hideCanvasButKeepItMeasurableForDmnJs();
    this.skeleton.classList.remove('hidden');
  }

  async open(xml: string): Promise<void> {
    this.destroy();
    this.viewer = new DmnViewer({
      container: this.canvas,
      decisionTable: { additionalModules: [DmnSimulationModule.decisionTable] },
    });
    await this.viewer.importXML(xml);
    const views = this.viewer.getViews();
    const table = views.find((view) => view.type === 'decisionTable') ?? views[0];
    if (table) await this.viewer.open(table);
  }

  reveal(): void {
    this.canvas.classList.remove('is-loading');
    this.skeleton.classList.add('hidden');
  }

  destroy(): void {
    this.viewer?.destroy();
    this.viewer = undefined;
  }

  private hideCanvasButKeepItMeasurableForDmnJs(): void {
    this.canvas.classList.add('is-loading');
  }
}
