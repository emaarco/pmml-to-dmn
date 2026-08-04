declare module 'dmn-moddle' {
  export interface ModdleElement {
    [key: string]: unknown;
  }

  export class DmnModdle {
    constructor(packages?: unknown, options?: unknown);
    create(type: string, attributes?: Record<string, unknown>): ModdleElement;
    toXML(element: ModdleElement, options?: { format?: boolean }): Promise<{ xml: string }>;
  }
}
