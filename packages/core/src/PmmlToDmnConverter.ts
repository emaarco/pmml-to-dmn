import type { IdGenerator } from './ids/IdGenerator';
import { RandomIdGenerator } from './ids/RandomIdGenerator';
import { SequentialIdGenerator } from './ids/SequentialIdGenerator';
import { DmnMapper } from './map/DmnMapper';
import type { DmnMetadata, DmnModel } from './model/dmn';
import { PmmlParser } from './parse/PmmlParser';
import { DmnSerializer } from './serialize/DmnSerializer';

export interface ConverterOptions {
  readonly deterministicIds?: boolean;
}

export interface ConversionResult {
  readonly xml: string;
  readonly model: DmnModel;
}

export class PmmlToDmnConverter {
  private readonly parser = new PmmlParser();
  private readonly mapper = new DmnMapper();
  private readonly serializer = new DmnSerializer();

  constructor(private readonly options: ConverterOptions = {}) {}

  async convert(pmml: string, metadata: DmnMetadata): Promise<ConversionResult> {
    const parsed = this.parser.parse(pmml);
    const model = this.mapper.map(parsed, metadata, this.idGeneratorForOneConversion());
    const xml = await this.serializer.serialize(model);
    return { xml, model };
  }

  private idGeneratorForOneConversion(): IdGenerator {
    return this.options.deterministicIds ? new SequentialIdGenerator() : new RandomIdGenerator();
  }
}
