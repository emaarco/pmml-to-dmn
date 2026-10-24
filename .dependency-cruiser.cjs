/**
 * Architecture gate (the Konsist/hexagonal replacement).
 * Enforces the Functional Core + Imperative Shell boundaries of the converter.
 */
const CONVERTER = '^packages/core/src/PmmlToDmnConverter\\.ts$';

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
      to: { path: ['^packages/core/src/(parse|map|serialize|ids|utils)/', CONVERTER] },
    },
    {
      name: 'parse-only-model',
      comment: 'parse/ may only depend on model/, not on other pipeline stages.',
      severity: 'error',
      from: { path: '^packages/core/src/parse/' },
      to: { path: ['^packages/core/src/(map|serialize|ids)/', CONVERTER] },
    },
    {
      name: 'map-only-model',
      comment: 'map/ may only depend on model/ and the IdGenerator seam, not on other stages.',
      severity: 'error',
      from: { path: '^packages/core/src/map/' },
      to: { path: ['^packages/core/src/(parse|serialize)/', CONVERTER] },
    },
    {
      name: 'serialize-only-model',
      comment: 'serialize/ may only depend on model/, not on other pipeline stages.',
      severity: 'error',
      from: { path: '^packages/core/src/serialize/' },
      to: { path: ['^packages/core/src/(parse|map|ids)/', CONVERTER] },
    },
    {
      name: 'ids-are-a-leaf',
      comment: 'The id generators know nothing about PMML, DMN or the pipeline.',
      severity: 'error',
      from: { path: '^packages/core/src/ids/' },
      to: { path: '^packages/core/src/', pathNot: '^packages/core/src/ids/' },
    },
    {
      name: 'utils-are-leaves',
      comment: 'utils/ hold small pure helpers; they may use the domain model but no classes.',
      severity: 'error',
      from: { path: '^(packages/[^/]+|apps/[^/]+)/src/utils/' },
      to: {
        path: '^(packages/[^/]+|apps/[^/]+)/src/',
        pathNot: ['^(packages/[^/]+|apps/[^/]+)/src/utils/', '^packages/core/src/model/'],
      },
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
