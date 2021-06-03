import {DOMOutputSpec, MarkSpec, Schema} from 'prosemirror-model';
import {ExtensionTypes, MarkExtensionComponent} from '../extension';
import {Keymap, toggleMark} from 'prosemirror-commands';

import {markInputRule} from '../utils';

/**
 * Html bold extension.
 */
export class StrongExtension implements MarkExtensionComponent {
  schema?: Schema;

  get name() {
    return 'Strong';
  }

  get types() {
    return [ExtensionTypes.Mark];
  }

  get markSpec(): MarkSpec {
    return {
      parseDOM: [
        {
          tag: 'b',
          getAttrs: dom =>
            (dom as unknown as HTMLElement).style.fontWeight !== 'normal' &&
            null,
        },
        {tag: 'strong'},
        {
          style: 'font-weight',
          getAttrs: dom =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(dom as string) && null,
        },
      ],
      toDOM(): DOMOutputSpec {
        return ['strong', 0];
      },
    };
  }

  get inputRules() {
    return [markInputRule(/\*\*([^\s](?:.*[^\s])?)\*\*(.)$/, this.markType)];
  }

  get markType() {
    if (!this.schema) {
      throw new Error('Schema not bound for extension.');
    }
    return this.schema.marks[this.name];
  }

  get keymap() {
    return {
      'Mod-b': toggleMark(this.markType),
      'Mod-B': toggleMark(this.markType),
    };
  }
}
