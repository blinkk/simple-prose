import {BaseEditor, EditorComponent} from './editor';

import {DOMSerializer} from 'prosemirror-model';

export class HtmlEditor extends BaseEditor implements EditorComponent {
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
}
