/**
 * Architecture gate (the Konsist/hexagonal replacement).
 * Enforces the Functional Core + Imperative Shell boundaries of the converter.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'No circular dependencies.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'map-is-pure',
      comment:
        'The pure transform layer (core/src/map) must not import external/vendor libs or Node built-ins.',
      severity: 'error',
      from: { path: '^packages/core/src/map/' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'core'] },
    },
    {
      name: 'model-is-a-leaf',
      comment: 'Domain model (core/src/model) may not depend on other core layers.',
      severity: 'error',
      from: { path: '^packages/core/src/model/' },
      to: { path: '^packages/core/src/(parse|map|serialize|id|convert)/' },
    },
    {
      name: 'parse-only-model',
      comment: 'parse/ may only depend on model/, not on other pipeline stages.',
      severity: 'error',
      from: { path: '^packages/core/src/parse/' },
      to: { path: '^packages/core/src/(map|serialize|convert)/' },
    },
    {
      name: 'map-only-model',
      comment: 'map/ may only depend on model/, not on other pipeline stages.',
      severity: 'error',
      from: { path: '^packages/core/src/map/' },
      to: { path: '^packages/core/src/(parse|serialize|convert)/' },
    },
    {
      name: 'serialize-only-model',
      comment: 'serialize/ may only depend on model/, not on other pipeline stages.',
      severity: 'error',
      from: { path: '^packages/core/src/serialize/' },
      to: { path: '^packages/core/src/(parse|map|convert)/' },
    },
    {
      name: 'shells-use-public-api',
      comment:
        'CLI and web (imperative shells) must import the core package entry, not its internals.',
      severity: 'error',
      from: { path: '^(packages/cli|apps/web)/src/' },
      to: { path: '^packages/core/src/(?!index)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.base.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
