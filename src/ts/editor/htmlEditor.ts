import {
  EditorComponent,
  EditorOptions,
  EditorUpdateHandler,
  createPluginsFromExtensions,
  createSchemaFromExtensions,
  defaultPlugins,
} from './editor';

import {DOMSerializer} from 'prosemirror-model';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Listeners} from '../utility/listeners';

export class HtmlEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  view: EditorView;
  listeners: Listeners;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.options = options;
    this.listeners = new Listeners();

    const schema = createSchemaFromExtensions(this.options?.extensions || []);
    const state = EditorState.create({
      schema,
      plugins: [
        // Default editor plugins.
        ...defaultPlugins,

        // Allow plugins directly in the editor options.
        ...(this.options?.plugins || []),

        // Generate plugins from the extensions.
        ...createPluginsFromExtensions(this.options?.extensions || []),
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
