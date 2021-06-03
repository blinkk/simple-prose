import {ExtensionComponent, ExtensionTypes} from '../extension';

/**
 * Markdown bold extension.
 */
export class StrongExtension implements ExtensionComponent {
  get name() {
    return 'Strong';
  }

  get types() {
    return [ExtensionTypes.Mark];
  }
}
