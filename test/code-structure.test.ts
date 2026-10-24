import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOTS = ['packages/core/src', 'packages/cli/src', 'apps/web/src'];

const sourceFiles = SOURCE_ROOTS.flatMap((root) =>
  readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map((file) => join(root, file)),
);

function isUtilsFile(path: string): boolean {
  return path.split('/').includes('utils');
}

function parse(path: string): ts.SourceFile {
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
}

function isFunctionExpression(node: ts.Expression | undefined): boolean {
  return node !== undefined && (ts.isArrowFunction(node) || ts.isFunctionExpression(node));
}

function topLevelFunctionNames(source: ts.SourceFile): string[] {
  return source.statements.flatMap((statement) => {
    if (ts.isFunctionDeclaration(statement)) return [statement.name?.text ?? '<anonymous>'];
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations
        .filter((declaration) => isFunctionExpression(declaration.initializer))
        .map((declaration) => declaration.name.getText(source));
    }
    return [];
  });
}

describe('code structure', () => {
  it.each(sourceFiles.filter((path) => !isUtilsFile(path)))(
    '%s keeps its functions inside classes',
    (path) => {
      expect(topLevelFunctionNames(parse(path))).toEqual([]);
    },
  );

  it.each(sourceFiles.filter(isUtilsFile))(
    '%s holds exactly one helper named after the file',
    (path) => {
      const source = parse(path);
      expect(topLevelFunctionNames(source)).toEqual([basename(path, '.ts')]);
      expect(source.statements.some(ts.isClassDeclaration)).toBe(false);
    },
  );
});
