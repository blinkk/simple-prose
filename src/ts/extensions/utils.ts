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

export function markInputRule(
  pattern: RegExp,
  markType: MarkType,
  getAttrs?: (match: string[]) => any
): InputRule {
  return new InputRule(pattern, (state, match, start, end) => {
    console.log(match, start, end);
    // only apply marks to non-empty text selections
    if (!(state.selection instanceof TextSelection)) {
      return null;
    }

    // determine if mark applies to match
    const $start = state.doc.resolve(start);
    const $end = state.doc.resolve(end);
    const range = [new SelectionRange($start, $end)];
    if (!markApplies(state.doc, range, markType)) {
      return null;
    }

    // apply mark
    const tr = state.tr.replaceWith(start, end, markType.schema.text(match[1]));
    return tr
      .addMark(
        tr.mapping.map(start),
        tr.mapping.map(end),
        markType.create(getAttrs ? getAttrs(match) : null)
      )
      .removeStoredMark(markType)
      .insertText(match[2]);
  });
}
