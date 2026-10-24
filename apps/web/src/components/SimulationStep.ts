import type { ConversionResult } from '@pmml-to-dmn/core';
import { countLabel } from '../utils/countLabel';
import { downloadFile } from '../utils/downloadFile';
import { h } from '../utils/h';
import { DecisionTableViewer } from './DecisionTableViewer';

interface OpenedModel {
  readonly name: string;
  readonly xml: string;
}

export class SimulationStep {
  readonly element: HTMLElement;
  private readonly viewer = new DecisionTableViewer();
  private readonly modelName = h('span', { class: 'model-name' }, 'model');
  private readonly resultMeta = h('span', { class: 'result-meta' }, '');
  private opened: OpenedModel | undefined;

  constructor(onBack: () => void) {
    const backButton = h('button', { type: 'button', class: 'secondary' }, '← Upload another');
    backButton.onclick = onBack;
    const copyButton = h('button', { type: 'button', class: 'secondary' }, 'Copy XML');
    copyButton.onclick = () => this.copyXml();
    const downloadButton = h('button', { type: 'button' }, 'Download .dmn');
    downloadButton.onclick = () => this.download();

    this.element = h(
      'section',
      { class: 'wpage' },
      h('div', { class: 'resultbar' }, this.modelName, this.resultMeta),
      this.viewer.element,
      h(
        'div',
        { class: 'wnav' },
        backButton,
        h('span', { class: 'wspacer' }),
        copyButton,
        downloadButton,
      ),
    );
  }

  setVisible(visible: boolean): void {
    this.element.classList.toggle('on', visible);
  }

  showLoading(modelName: string): void {
    this.viewer.showLoading(modelName);
  }

  async show(name: string, conversion: ConversionResult): Promise<void> {
    this.opened = { name, xml: conversion.xml };
    await this.viewer.open(conversion.xml);
    const { rules, inputs } = conversion.model.decision.table;
    this.modelName.textContent = name;
    this.resultMeta.textContent = `${countLabel(rules.length, 'rule')} · ${countLabel(inputs.length, 'input')} · DMN 1.3`;
  }

  reveal(): void {
    this.viewer.reveal();
  }

  clear(): void {
    this.viewer.destroy();
    this.opened = undefined;
  }

  private download(): void {
    if (this.opened) downloadFile(`${this.opened.name}.dmn`, this.opened.xml, 'application/xml');
  }

  private copyXml(): void {
    if (this.opened) void navigator.clipboard?.writeText(this.opened.xml);
  }
}
