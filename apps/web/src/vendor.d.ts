declare module '*.css';

declare module 'dmn-js/lib/Viewer' {
  export interface DmnView {
    id: string;
    type: string;
    element: unknown;
  }

  export default class DmnJS {
    constructor(options?: { container?: HTMLElement | string });
    importXML(xml: string): Promise<{ warnings: unknown[] }>;
    getViews(): DmnView[];
    open(view: DmnView): Promise<{ warnings: unknown[] }>;
    destroy(): void;
  }
}
