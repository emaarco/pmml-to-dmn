import { writeFileSync } from 'node:fs';
import { cac } from 'cac';
import { convertFile } from './convert-file';

async function main(): Promise<void> {
  const cli = cac('pmml2dmn');

  cli
    .command('<input>', 'Convert a PMML decision-tree model into a DMN decision table')
    .option('-o, --output <file>', 'DMN output file (defaults to stdout)')
    .option('--model-id <id>', 'id of the generated DMN model', { default: 'pmml-to-dmn' })
    .option('--model-name <name>', 'name of the generated DMN model', { default: 'PMML to DMN' })
    .option('--decision-id <id>', 'id of the generated decision', { default: 'decision' })
    .option('--decision-name <name>', 'name of the generated decision', { default: 'Decision' })
    .option('--deterministic', 'use sequential (reproducible) element ids')
    .action(async (input: string, options: Record<string, unknown>) => {
      const xml = await convertFile(input, {
        modelId: String(options.modelId),
        modelName: String(options.modelName),
        decisionId: String(options.decisionId),
        decisionName: String(options.decisionName),
        deterministic: Boolean(options.deterministic),
      });

      const output = options.output as string | undefined;
      if (output) {
        writeFileSync(output, xml);
        process.stderr.write(`Wrote DMN model to ${output}\n`);
      } else {
        process.stdout.write(xml);
      }
    });

  cli.help();
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
