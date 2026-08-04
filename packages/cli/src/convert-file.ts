import { readFileSync } from 'node:fs';
import { convert, sequentialIdGenerator } from '@pmml-to-dmn/core';

export interface ConvertFileOptions {
  readonly modelId: string;
  readonly modelName: string;
  readonly decisionId: string;
  readonly decisionName: string;
  readonly deterministic?: boolean;
}

/** Read a PMML file and convert it to a DMN XML string. */
export async function convertFile(inputPath: string, options: ConvertFileOptions): Promise<string> {
  const pmml = readFileSync(inputPath, 'utf8');
  return convert(pmml, {
    modelId: options.modelId,
    modelName: options.modelName,
    decisionId: options.decisionId,
    decisionName: options.decisionName,
    idGenerator: options.deterministic ? sequentialIdGenerator() : undefined,
  });
}
