import {EditorComponent, EditorOptions} from './editor';

export class MarkdownEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.options = options;
  }

  get language(): string {
    return 'markdown';
  }
}
