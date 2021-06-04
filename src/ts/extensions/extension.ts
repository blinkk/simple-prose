import {
  MarkSpec,
  MarkType,
  NodeSpec,
  NodeType,
  Schema,
} from 'prosemirror-model';
import {InputRule} from 'prosemirror-inputrules';
import {Keymap} from 'prosemirror-commands';
import {MenuOptions} from '../editor/menu';
import {NodeView} from 'prosemirror-view';
import {Plugin} from 'prosemirror-state';

export enum ExtensionTypes {
  Mark = 'Mark',
  Node = 'Node',
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtensionOptions {}

export interface ExtensionComponent {
  inputRules?: Array<InputRule>;
  keymap?: Keymap;
  menu?: Array<MenuOptions>;
  name: string;
  plugins?: Array<Plugin>;
  schema?: Schema;
  types: Array<ExtensionTypes>;
}

export interface NodeExtensionComponent extends ExtensionComponent {
  nodeSpec?: NodeSpec;
  nodeType?: NodeType;
  nodeView?: NodeView;
}

export interface MarkExtensionComponent extends ExtensionComponent {
  markSpec?: MarkSpec;
  markType?: MarkType;
}

export interface ExtensionConstructor {
  new (options: ExtensionOptions): ExtensionComponent;
}
