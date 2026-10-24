import { readFileSync, writeFileSync } from 'node:fs';
import { PmmlToDmnConverter, parseHitPolicy } from '@pmml-to-dmn/core';
import { type CAC, cac } from 'cac';

interface TextOutput {
  write(text: string): unknown;
}

interface ConvertCommandOptions {
  readonly output?: string;
  readonly modelId: string;
  readonly modelName: string;
  readonly decisionId: string;
  readonly decisionName: string;
  readonly hitPolicy: string;
  readonly deterministic?: boolean;
}

export class PmmlToDmnCli {
  constructor(
    private readonly stdout: TextOutput = process.stdout,
    private readonly stderr: TextOutput = process.stderr,
  ) {}

  async run(argv: readonly string[]): Promise<number> {
    try {
      const cli = this.createCli();
      cli.parse([...argv], { run: false });
      await cli.runMatchedCommand();
      return 0;
    } catch (error) {
      this.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  }

  private createCli(): CAC {
    const cli = cac('pmml2dmn');
    cli
      .command('<input>', 'Convert a PMML decision-tree model into a DMN decision table')
      .option('-o, --output <file>', 'DMN output file (defaults to stdout)')
      .option('--model-id <id>', 'id of the generated DMN model', { default: 'pmml-to-dmn' })
      .option('--model-name <name>', 'name of the generated DMN model', { default: 'PMML to DMN' })
      .option('--decision-id <id>', 'id of the generated decision', { default: 'decision' })
      .option('--decision-name <name>', 'name of the generated decision', { default: 'Decision' })
      .option('--hit-policy <policy>', 'hit policy of the decision table (UNIQUE, FIRST, ANY)', {
        default: 'FIRST',
      })
      .option('--deterministic', 'use sequential (reproducible) element ids')
      .action((input: string, options: ConvertCommandOptions) => this.convert(input, options));
    cli.help();
    return cli;
  }

  private async convert(inputPath: string, options: ConvertCommandOptions): Promise<void> {
    const converter = new PmmlToDmnConverter({ deterministicIds: options.deterministic });
    const { xml } = await converter.convert(readFileSync(inputPath, 'utf8'), {
      modelId: String(options.modelId),
      modelName: String(options.modelName),
      decisionId: String(options.decisionId),
      decisionName: String(options.decisionName),
      hitPolicy: parseHitPolicy(String(options.hitPolicy)),
    });

    if (options.output) {
      writeFileSync(options.output, xml);
      this.stderr.write(`Wrote DMN model to ${options.output}\n`);
    } else {
      this.stdout.write(xml);
    }
  }
}
