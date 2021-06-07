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
import {MarkdownParser, defaultMarkdownSerializer} from 'prosemirror-markdown';
import Token from 'markdown-it/lib/token';
import markdownit from 'markdown-it';

const MarkdownItConfig = {
  // blockquote: {block: 'blockquote'},
  paragraph: {block: 'paragraph'},
  // list_item: {block: 'list_item'},
  // bullet_list: {
  //   block: 'bullet_list',
  //   getAttrs: (_: Token, tokens: Array<Token>, i: number) => ({
  //     tight: listIsTight(tokens, i),
  //   }),
  // },
  // ordered_list: {
  //   block: 'ordered_list',
  //   getAttrs: (token: Token, tokens: Array<Token>, i: number) => ({
  //     order: +(token.attrGet('start') || 1),
  //     tight: listIsTight(tokens, i),
  //   }),
  // },
  // heading: {
  //   block: 'heading',
  //   getAttrs: (token: Token) => ({level: +token.tag.slice(1)}),
  // },
  code_block: {block: 'code_block', noCloseToken: true},
  fence: {
    block: 'code_block',
    getAttrs: (token: Token) => ({params: token.info || ''}),
    noCloseToken: true,
  },
  hr: {node: 'horizontal_rule'},
  // image: {
  //   node: 'image',
  //   getAttrs: (token: Token) => ({
  //     src: token.attrGet('src'),
  //     title: token.attrGet('title') || null,
  //     alt:
  //       (token.children && token.children[0] && token.children[0].content) ||
  //       null,
  //   }),
  // },
  hardbreak: {node: 'hard_break'},
  // em: {mark: 'em'},
  strong: {mark: 'strong'},
  // link: {
  //   mark: 'link',
  //   getAttrs: (token: Token) => ({
  //     href: token.attrGet('href'),
  //     title: token.attrGet('title') || null,
  //   }),
  // },
  // code_inline: {mark: 'code', noCloseToken: true},
};

export class MarkdownEditor implements EditorComponent {
  container: HTMLElement;
  options?: EditorOptions;
  view: EditorView;
  listeners: Listeners;
  private parser: MarkdownParser;

  constructor(container: HTMLElement, options?: EditorOptions) {
    this.container = container;
    this.container.classList.add('sp');
    this.options = options;
    this.listeners = new Listeners();

    const schema = createSchemaFromExtensions(this.options?.extensions || []);
    console.log(schema.marks);

    this.parser = new MarkdownParser(
      schema,
      markdownit('commonmark', {html: false}),
      MarkdownItConfig
    );
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
    return 'markdown';
  }

  get value(): string {
    console.log(defaultMarkdownSerializer.serialize(this.view.state.doc));

    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

  onUpdate(handler: EditorUpdateHandler): EditorComponent {
    this.listeners.add('update', handler);

    // Allow chaining when creating the editor.
    return this;
  }
}

function listIsTight(tokens: Array<Token>, i: number) {
  while (++i < tokens.length)
    if (tokens[i].type !== 'list_item_open') return tokens[i].hidden;
  return false;
}
