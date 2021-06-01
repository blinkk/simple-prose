// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtensionOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtensionComponent {}

export interface ExtensionConstructor {
  new (options: ExtensionOptions): ExtensionComponent;
}
