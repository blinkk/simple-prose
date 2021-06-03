import {MarkSpec, NodeSpec} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';
import {ExtensionComponent} from '../extensions/extension';
import {Transaction} from 'prosemirror-state';

export type EditorUpdateHandler = (
  editor: EditorComponent,
  transaction: Transaction<any>
) => void;

export type SchemaMarkTypes = {[x: string]: MarkSpec};
export type SchemaNodeTypes = {[x: string]: NodeSpec};

export interface EditorOptions {
  extensions: Array<ExtensionComponent>;
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
