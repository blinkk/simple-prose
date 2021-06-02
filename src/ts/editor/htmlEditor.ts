import {EditorComponent, EditorOptions, EditorUpdateHandler} from './editor';
import {history, redo, undo} from 'prosemirror-history';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Listeners} from '../utility/listeners';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {schema} from 'prosemirror-schema-basic';
import {DOMSerializer} from 'prosemirror-model';

export class HtmlEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  view: EditorView;
  listeners: Listeners;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.options = options;
    this.listeners = new Listeners();

    const state = EditorState.create({
      schema,
      plugins: [
        history(),
        keymap({'Mod-z': undo, 'Mod-y': redo}),
        keymap(baseKeymap),
      ],
    });
    this.view = new EditorView(this.container, {
      state,
      dispatchTransaction: transaction => {
        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);
        this.listeners.trigger('update', this);
      },
    });
  }

  get language(): string {
    return 'html';
  }

  get value(): string {
    const div = document.createElement('div');

    div.appendChild(
      DOMSerializer.fromSchema(this.view.state.schema).serializeFragment(
        this.view.state.doc.content
      )
    );

    return div.innerHTML;
  }

  onUpdate(handler: EditorUpdateHandler): EditorComponent {
    this.listeners.add('update', handler);

    // Allow chaining when creating the editor.
    return this;
  }
}
