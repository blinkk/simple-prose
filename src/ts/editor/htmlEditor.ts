import {EditorComponent, EditorOptions} from './editor';
import {history, redo, undo} from 'prosemirror-history';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {schema} from 'prosemirror-schema-basic';

export class HtmlEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  state: EditorState;
  view: EditorView;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.options = options;

    const state = EditorState.create({
      schema,
      plugins: [
        history(),
        keymap({'Mod-z': undo, 'Mod-y': redo}),
        keymap(baseKeymap),
      ],
    });
    this.state = state;
    this.view = new EditorView(this.container, {
      state,
    });
  }

  get language(): string {
    return 'html';
  }
}
