import {EditorState, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

export type EditorUpdateHandler = (
  editor: EditorComponent,
  transaction: Transaction<any>
) => void;

export interface EditorOptions {
  extensions: Array<any>;
}

export interface EditorComponent {
  container: HTMLElement;
  onUpdate: (handler: EditorUpdateHandler) => EditorComponent;
  options?: EditorOptions;
  language: string;
  value: string;
  view: EditorView;
}

export interface EditorConstructor {
  new (container: HTMLElement, options?: EditorOptions): EditorComponent;
}
