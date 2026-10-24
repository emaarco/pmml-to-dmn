import { h } from '../utils/h';

export type WizardStep = 1 | 2;

export class Stepper {
  readonly element: HTMLElement;
  private readonly steps: ReadonlyMap<WizardStep, HTMLElement>;
  private readonly bar = h('div', { class: 'bar' });

  constructor(onSelect: (step: WizardStep) => void) {
    const upload = this.stepElement(1, 'Upload', onSelect);
    const simulate = this.stepElement(2, 'Simulate', onSelect);
    this.steps = new Map([
      [1, upload],
      [2, simulate],
    ]);
    this.element = h('div', { class: 'stepper' }, upload, this.bar, simulate);
  }

  update(current: WizardStep, hasModel: boolean): void {
    for (const [step, element] of this.steps) {
      element.classList.toggle('active', step === current);
      element.classList.toggle('done', step < current);
      element.classList.toggle('disabled', step === 2 && !hasModel);
    }
    this.bar.classList.toggle('done', current > 1 && hasModel);
  }

  private stepElement(
    step: WizardStep,
    label: string,
    onSelect: (step: WizardStep) => void,
  ): HTMLElement {
    const element = h(
      'div',
      { class: 'step' },
      h('span', { class: 'num' }, String(step)),
      h('span', { class: 'lbl' }, label),
    );
    element.onclick = () => onSelect(step);
    return element;
  }
}
