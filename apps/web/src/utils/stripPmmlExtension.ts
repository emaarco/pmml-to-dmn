export function stripPmmlExtension(fileName: string): string {
  return fileName.replace(/\.(pmml|xml)$/i, '');
}
