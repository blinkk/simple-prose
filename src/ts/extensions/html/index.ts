import {ExtensionConstructor} from '../extension';
import {StrongExtension} from './strongExtension';

export const ALL: Array<ExtensionConstructor> = [StrongExtension];

// Export individual built-in extensions.
export {StrongExtension};
