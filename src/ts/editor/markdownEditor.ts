import {BaseEditor, EditorComponent} from './editor';

import {DOMSerializer} from 'prosemirror-model';

export class MarkdownEditor extends BaseEditor implements EditorComponent {
  get language(): string {
    return 'markdown';
  }

  get value(): string {
    // TODO: Get the markdown value.
    const div = document.createElement('div');

    div.appendChild(
      DOMSerializer.fromSchema(this.view.state.schema).serializeFragment(
        this.view.state.doc.content
      )
    );

    return div.innerHTML;
  }
}
