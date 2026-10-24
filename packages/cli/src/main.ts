import { PmmlToDmnCli } from './PmmlToDmnCli';

process.exitCode = await new PmmlToDmnCli().run(process.argv);
