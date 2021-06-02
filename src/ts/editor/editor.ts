export interface EditorOptions {
  extensions: Array<any>;
}

export interface EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  language: string;
}

export interface EditorConstructor {
  new (container: HTMLElement, options?: EditorOptions): EditorComponent;
}
