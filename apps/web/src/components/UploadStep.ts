import { HIT_POLICIES, type HitPolicy, parseHitPolicy } from '@pmml-to-dmn/core';
import { SAMPLE_PMML } from '../sample';
import { h } from '../utils/h';

const UPLOAD_ICON =
  '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>';

export class UploadStep {
  readonly element: HTMLElement;
  private readonly fileInput = h('input', {
    type: 'file',
    accept: '.pmml,.xml,application/xml,text/xml',
    hidden: '',
  });
  private readonly hitPolicySelect = h(
    'select',
    {},
    ...HIT_POLICIES.map((policy) =>
      h('option', policy === 'FIRST' ? { value: policy, selected: '' } : { value: policy }, policy),
    ),
  );
  private readonly error = h('p', { class: 'error' });

  constructor(private readonly onPmml: (pmml: string, fileName: string) => void) {
    this.fileInput.onchange = () => this.submit(this.fileInput.files?.[0]);

    const exampleButton = h(
      'button',
      { type: 'button', class: 'link-btn' },
      'try the example model',
    );
    exampleButton.onclick = () => this.onPmml(SAMPLE_PMML, 'credit-score.pmml');

    this.element = h(
      'section',
      { class: 'wpage' },
      h(
        'div',
        { class: 'panel narrow' },
        h('h1', {}, 'Upload a PMML model'),
        h(
          'p',
          { class: 'lead' },
          'A decision-tree PMML file. Everything runs locally in your browser — nothing is uploaded.',
        ),
        this.fileInput,
        this.dropzone(),
        h(
          'label',
          { class: 'hit-policy' },
          'Hit policy of the decision table',
          this.hitPolicySelect,
        ),
        this.error,
        h('div', { class: 'or' }, 'or ', exampleButton),
      ),
    );
  }

  hitPolicy(): HitPolicy {
    return parseHitPolicy(this.hitPolicySelect.value);
  }

  setVisible(visible: boolean): void {
    this.element.classList.toggle('on', visible);
  }

  showError(message: string): void {
    this.error.textContent = message;
  }

  reset(): void {
    this.showError('');
    this.fileInput.value = '';
  }

  private dropzone(): HTMLButtonElement {
    const icon = h('span', { class: 'dropzone-icon' });
    icon.innerHTML = UPLOAD_ICON;
    const dropzone = h(
      'button',
      { type: 'button', class: 'dropzone' },
      icon,
      h('div', { class: 'dropzone-title' }, 'Drop a PMML file here'),
      h('div', { class: 'dropzone-hint' }, 'or click to browse'),
    );
    dropzone.onclick = () => this.fileInput.click();
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('dragging');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragging');
      this.submit(event.dataTransfer?.files?.[0]);
    });
    return dropzone;
  }

  private submit(file: File | undefined): void {
    if (file) void file.text().then((pmml) => this.onPmml(pmml, file.name));
  }
}
