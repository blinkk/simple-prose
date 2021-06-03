import {DOMSerializer, Schema} from 'prosemirror-model';
import {
  EditorComponent,
  EditorOptions,
  EditorUpdateHandler,
  SchemaMarkTypes,
  SchemaNodeTypes,
} from './editor';
import {EditorState, Plugin} from 'prosemirror-state';
import {
  ExtensionTypes,
  MarkExtensionComponent,
  NodeExtensionComponent,
} from '../extensions/extension';
import {history, redo, undo} from 'prosemirror-history';

import {EditorView} from 'prosemirror-view';
import {Listeners} from '../utility/listeners';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';

export class HtmlEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  view: EditorView;
  listeners: Listeners;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.options = options;
    this.listeners = new Listeners();

    const schema = this.schema;
    const state = EditorState.create({
      schema,
      plugins: [
        // Basic 'standard' editor plugins.
        history(),
        keymap(baseKeymap),
        keymap({'Mod-z': undo, 'Mod-y': redo}),

        // Allow plugins directly in the editor options.
        ...(this.options?.plugins || []),

        // Generate plugins from the extensions.
        ...this.plugins,
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

  get plugins(): Array<Plugin> {
    const plugins: Array<Plugin> = [];

    for (const ext of this.options?.extensions || []) {
      const extKeymap = ext.keymap;
      if (extKeymap) {
        plugins.push(keymap(extKeymap));
      }
    }

    return plugins;
  }

  get schema(): Schema {
    // Default mark specs for the editor.
    const markSpecs: SchemaMarkTypes = {
      // code: {
      //   parseDOM: [{tag: 'code'}],
      //   toDOM() {
      //     return ['code', 0];
      //   },
      // },
      // em: {
      //   parseDOM: [{tag: 'i'}, {tag: 'em'}, {style: 'font-style=italic'}],
      //   toDOM() {
      //     return ['em', 0];
      //   },
      // },
      // link: {
      //   attrs: {
      //     href: {},
      //     title: {default: null},
      //   },
      //   inclusive: false,
      //   parseDOM: [
      //     {
      //       tag: 'a[href]',
      //       getAttrs(dom) {
      //         return {
      //           href: (dom as unknown as HTMLElement).getAttribute('href'),
      //           title: (dom as unknown as HTMLElement).getAttribute('title'),
      //         };
      //       },
      //     },
      //   ],
      //   toDOM(node) {
      //     const {href, title} = node.attrs;
      //     return ['a', {href, title}, 0];
      //   },
      // },
    };

    // Default node specs for the editor.
    const nodeSpecs: SchemaNodeTypes = {
      // blockquote: {
      //   content: 'block+',
      //   group: 'block',
      //   defining: true,
      //   parseDOM: [{tag: 'blockquote'}],
      //   toDOM() {
      //     return ['blockquote', 0];
      //   },
      // },

      // code_block: {
      //   content: 'text*',
      //   marks: '',
      //   group: 'block',
      //   code: true,
      //   defining: true,
      //   parseDOM: [{tag: 'pre', preserveWhitespace: 'full'}],
      //   toDOM() {
      //     return ['pre', ['code', 0]];
      //   },
      // },

      doc: {
        content: 'block+',
      },

      // hard_break: {
      //   inline: true,
      //   group: 'inline',
      //   selectable: false,
      //   parseDOM: [{tag: 'br'}],
      //   toDOM() {
      //     return ['br'];
      //   },
      // },

      // horizontal_rule: {
      //   group: 'block',
      //   parseDOM: [{tag: 'hr'}],
      //   toDOM() {
      //     return ['hr'];
      //   },
      // },

      // heading: {
      //   attrs: {level: {default: 1}},
      //   content: 'inline*',
      //   group: 'block',
      //   defining: true,
      //   parseDOM: [
      //     {tag: 'h1', attrs: {level: 1}},
      //     {tag: 'h2', attrs: {level: 2}},
      //     {tag: 'h3', attrs: {level: 3}},
      //     {tag: 'h4', attrs: {level: 4}},
      //     {tag: 'h5', attrs: {level: 5}},
      //     {tag: 'h6', attrs: {level: 6}},
      //   ],
      //   toDOM(node) {
      //     return ['h' + node.attrs.level, 0];
      //   },
      // },

      // image: {
      //   inline: true,
      //   attrs: {
      //     src: {},
      //     alt: {default: null},
      //     title: {default: null},
      //   },
      //   group: 'inline',
      //   draggable: true,
      //   parseDOM: [
      //     {
      //       tag: 'img[src]',
      //       getAttrs(dom) {
      //         return {
      //           src: (dom as unknown as HTMLElement).getAttribute('src'),
      //           title: (dom as unknown as HTMLElement).getAttribute('title'),
      //           alt: (dom as unknown as HTMLElement).getAttribute('alt'),
      //         };
      //       },
      //     },
      //   ],
      //   toDOM(node) {
      //     const {src, alt, title} = node.attrs;
      //     return ['img', {src, alt, title}];
      //   },
      // },

      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{tag: 'p'}],
        toDOM() {
          return ['p', 0];
        },
      },

      text: {
        group: 'inline',
      },
    };

    // Use extensions to create the mark and node specs for the schema.
    for (const ext of this.options?.extensions || []) {
      const name = ext.name;

      if (name in nodeSpecs) {
        throw new Error(`Duplicate node name: '${name}'!`);
      }

      if (name in markSpecs) {
        throw new Error(`Duplicate mark name: '${name}'!`);
      }

      // Add mark specs from extensions.
      if (ext.types.includes(ExtensionTypes.Mark)) {
        const markSpec = (ext as MarkExtensionComponent).markSpec;

        if (markSpec) {
          markSpecs[name] = markSpec;
        }
      }

      // Add node specs from extensions.
      if (ext.types.includes(ExtensionTypes.Node)) {
        const nodeSpec = (ext as NodeExtensionComponent).nodeSpec;

        if (nodeSpec) {
          nodeSpecs[name] = nodeSpec;
        }
      }
    }

    // build schema
    const schema = new Schema({
      nodes: nodeSpecs,
      marks: markSpecs,
    });

    // Set the schema for all of the extensions.
    // Allows the extension to access the schema (ex: retrieve the node type).
    for (const ext of this.options?.extensions || []) {
      ext.schema = schema;
    }

    return schema;
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
