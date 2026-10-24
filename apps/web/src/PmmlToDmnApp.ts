import { PmmlToDmnConverter } from '@pmml-to-dmn/core';
import { Footer } from './components/Footer';
import { SimulationStep } from './components/SimulationStep';
import { Stepper, type WizardStep } from './components/Stepper';
import { UploadStep } from './components/UploadStep';
import { h } from './utils/h';
import { stripPmmlExtension } from './utils/stripPmmlExtension';
import { waitAtLeast } from './utils/waitAtLeast';

const MINIMUM_LOADING_MS = 500;

export class PmmlToDmnApp {
  private readonly converter = new PmmlToDmnConverter();
  private readonly stepper = new Stepper((step) => this.showStep(step));
  private readonly upload = new UploadStep((pmml, fileName) => {
    void this.convertAndOpen(pmml, fileName);
  });
  private readonly simulation = new SimulationStep(() => this.convertAnother());
  private hasModel = false;

  constructor(private readonly container: HTMLElement) {}

  mount(): void {
    this.container.replaceChildren(
      h(
        'main',
        { class: 'appmain' },
        h('div', { class: 'brand' }, 'PMML ', h('span', { class: 'g' }, '→'), ' DMN'),
        this.stepper.element,
        h('div', { class: 'wstage' }, this.upload.element, this.simulation.element),
      ),
      new Footer().element,
    );
    this.showStep(1);
  }

  private showStep(step: WizardStep): void {
    if (step === 2 && !this.hasModel) return;
    this.upload.setVisible(step === 1);
    this.simulation.setVisible(step === 2);
    this.stepper.update(step, this.hasModel);
    window.scrollTo({ top: 0 });
  }

  private async convertAndOpen(pmml: string, fileName: string): Promise<void> {
    const name = stripPmmlExtension(fileName);
    this.upload.showError('');
    this.hasModel = true;
    this.showStep(2);
    this.simulation.showLoading(name);
    const startedAt = performance.now();
    try {
      const conversion = await this.converter.convert(pmml, {
        modelId: 'pmml-to-dmn',
        modelName: name,
        decisionId: 'decision',
        decisionName: 'Decision',
        hitPolicy: this.upload.hitPolicy(),
      });
      await this.simulation.show(name, conversion);
      await waitAtLeast(MINIMUM_LOADING_MS, startedAt);
      this.simulation.reveal();
    } catch (error) {
      this.simulation.clear();
      this.hasModel = false;
      this.showStep(1);
      this.upload.showError(error instanceof Error ? error.message : String(error));
    }
  }

  private convertAnother(): void {
    this.simulation.clear();
    this.hasModel = false;
    this.upload.reset();
    this.showStep(1);
  }
}
