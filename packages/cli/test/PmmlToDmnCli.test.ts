import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PmmlToDmnCli } from '../src/PmmlToDmnCli';

class CapturedOutput {
  text = '';

  write(chunk: string): void {
    this.text += chunk;
  }
}

async function runCli(...args: string[]) {
  const stdout = new CapturedOutput();
  const stderr = new CapturedOutput();
  const exitCode = await new PmmlToDmnCli(stdout, stderr).run(['node', 'pmml2dmn', ...args]);
  return { exitCode, stdout: stdout.text, stderr: stderr.text };
}

describe('PmmlToDmnCli', () => {
  it('prints the deterministic DMN of a PMML file to stdout', async () => {
    const result = await runCli(
      'examples/credit-score.pmml',
      '--deterministic',
      '--model-id',
      'm1',
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('id="m1"');
    expect(result.stdout).toContain('<dmn:text>&gt;= 50</dmn:text>');
    expect(result.stdout).toContain('<dmn:text>"PASS"</dmn:text>');
  });

  it('writes the DMN to the output file', async () => {
    const output = join(mkdtempSync(join(tmpdir(), 'pmml2dmn-')), 'out.dmn');
    const result = await runCli('examples/credit-score.pmml', '--deterministic', '-o', output);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe(`Wrote DMN model to ${output}\n`);
    expect(readFileSync(output, 'utf8')).toContain('hitPolicy="FIRST"');
  });

  it('passes the hit policy through', async () => {
    const result = await runCli('examples/credit-score.pmml', '--hit-policy', 'ANY');
    expect(result.stdout).toContain('hitPolicy="ANY"');
  });

  it('fails with the reason on an unsupported hit policy', async () => {
    const result = await runCli('examples/credit-score.pmml', '--hit-policy', 'COLLECT');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unsupported hit policy 'COLLECT'");
  });

  it('fails on a missing file', async () => {
    const result = await runCli('does-not-exist.pmml');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('does-not-exist.pmml');
  });
});
