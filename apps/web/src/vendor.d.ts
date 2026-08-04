declare module '*.css';

declare module 'dmn-js/lib/Viewer' {
  export interface DmnView {
    id: string;
    type: string;
    element: unknown;
  }

  export interface DmnViewConfig {
    additionalModules?: unknown[];
  }

  export interface DmnViewerOptions {
    container?: HTMLElement | string;
    decisionTable?: DmnViewConfig;
    drd?: DmnViewConfig;
  }

  /** Read-only dmn-js manager — renders + simulates, but cannot edit the model. */
  export default class DmnViewer {
    constructor(options?: DmnViewerOptions);
    importXML(xml: string): Promise<{ warnings: unknown[] }>;
    getViews(): DmnView[];
    open(view: DmnView): Promise<{ warnings: unknown[] }>;
    destroy(): void;
  }
}
