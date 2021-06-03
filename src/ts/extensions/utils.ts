import {EditorState, SelectionRange, TextSelection} from 'prosemirror-state';

import {InputRule} from 'prosemirror-inputrules';
import {MarkType} from 'prosemirror-model';
import {Node} from 'prosemirror-model';

export function markActive(state: EditorState, type: MarkType) {
  const {from, $from, to, empty} = state.selection;
  if (empty) return type.isInSet(state.storedMarks || $from.marks());
  else return state.doc.rangeHasMark(from, to, type);
}

export function markApplies(
  doc: Node,
  ranges: SelectionRange[],
  type: MarkType
): boolean {
  for (let i = 0; i < ranges.length; i++) {
    const {$from, $to} = ranges[i];
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;

    doc.nodesBetween($from.pos, $to.pos, node => {
      can = can || (node.inlineContent && node.type.allowsMarkType(type));
    });

    if (can) {
      return true;
    }
  }
  return false;
}

export interface MarkInputRuleOptions {
  pattern: RegExp;
  markType: MarkType;
  getAttrs?: (match: string[]) => any;
}

export function markInputRule(options: MarkInputRuleOptions): InputRule {
  return new InputRule(options.pattern, (state, match, start, end) => {
    // Only apply marks to non-empty text selections.
    if (!(state.selection instanceof TextSelection)) {
      return null;
    }

    // Determine if mark applies to match.
    const $start = state.doc.resolve(start);
    const $end = state.doc.resolve(end);
    const range = [new SelectionRange($start, $end)];
    if (!markApplies(state.doc, range, options.markType)) {
      return null;
    }

    const tr = state.tr.replaceWith(
      start,
      end,
      options.markType.schema.text(match[1])
    );

    return tr
      .addMark(
        tr.mapping.map(start),
        tr.mapping.map(end),
        options.markType.create(
          options.getAttrs ? options.getAttrs(match) : null
        )
      )
      .removeStoredMark(options.markType)
      .insertText(match[2]);
  });
}
