import { h } from './h';

export function downloadFile(fileName: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  h('a', { href: url, download: fileName }).click();
  URL.revokeObjectURL(url);
}
