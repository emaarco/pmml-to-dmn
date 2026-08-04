import { type IdGenerator, uuidIdGenerator } from './id';
import type { DmnMetadata } from './map/map-to-dmn';
import { mapToDmn } from './map/map-to-dmn';
import type { DmnModel } from './model/dmn';
import { parsePmml } from './parse/parse-pmml';
import { serializeDmn } from './serialize/serialize-dmn';

export interface ConvertOptions extends DmnMetadata {
  /** Id strategy; defaults to random ids. Pass `sequentialIdGenerator()` for reproducible output. */
  readonly idGenerator?: IdGenerator;
}

/** Both representations of a conversion: the DMN XML and the structured model (for simulation). */
export interface ConversionResult {
  readonly xml: string;
  readonly model: DmnModel;
}

/**
 * The public pipeline: PMML string -> parse -> map -> serialize -> DMN XML string.
 * This is the functional core; all I/O lives in the CLI and web shells.
 */
export async function convert(pmml: string, options: ConvertOptions): Promise<string> {
  return (await convertDetailed(pmml, options)).xml;
}

/** Like [convert], but also returns the structured [DmnModel] (e.g. to drive a simulation). */
export async function convertDetailed(
  pmml: string,
  options: ConvertOptions,
): Promise<ConversionResult> {
  const nextId = options.idGenerator ?? uuidIdGenerator();
  const parsed = parsePmml(pmml);
  const model = mapToDmn(parsed, options, nextId);
  const xml = await serializeDmn(model);
  return { xml, model };
}
