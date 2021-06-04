import * as HtmlExtensions from '../extensions/html';
import * as MarkdownExtensions from '../extensions/markdown';

import {EditorComponent, EditorOptions} from '../editor/editor';

import {
  ExtensionComponent,
  ExtensionConstructor,
} from '../extensions/extension';
import {HtmlEditor} from '../editor/htmlEditor';
import {MarkdownEditor} from '../editor/markdownEditor';
import Prism from 'prismjs';
import {html} from 'js-beautify';

/**
 * Understands the structure of the editor page and crafts the example experience
 * and edtiors for testing.
 */
class ExampleEditor {
  container: HTMLElement;
  demo: HTMLElement;
  editor?: EditorComponent;
  example: HTMLElement;
  options: EditorOptions;
  output: HTMLElement;
  typeClass: string;
  typeExtensions: string;

  constructor(container: HTMLElement) {
    this.container = container;
    this.typeClass = this.container.dataset.typeClass as string;
    this.typeExtensions = this.container.dataset.typeExtensions as string;
    this.options = JSON.parse(this.container.dataset.typeOptions || '{}');
    this.demo = container.querySelector('.editor__demo') as HTMLElement;
    this.output = container.querySelector(
      '.editor__output code'
    ) as HTMLElement;
    this.example = container.querySelector(
      '.editor__example code'
    ) as HTMLElement;

    this.createEditor();

    if (!this.editor) {
      console.error('Unable to determine class for the example.');
      this.demo.innerText = 'Unable to determine class for the example.';
      this.output.innerText = 'Unable to determine class for the example.';
      this.example.innerText = 'Unable to determine class for the example.';
      return;
    }

    this.showExample();
    this.showOutput();
  }

  createEditor() {
    // Unimplemented in base example.
  }

  get extensions(): Array<ExtensionComponent> {
    return [];
  }

  showExample() {
    const extensions = this.extensions;
    const extensionClasses: Array<string> = [];

    for (const extension of extensions) {
      // TODO: Determine how to pass options.
      extensionClasses.push(
        `new ${this.typeExtensions}.${extension.constructor.name}()`
      );
    }

    const optionsStub = Object.assign({}, this.options, {
      extensions: '{{stub}}',
    });

    const optionsExample = JSON.stringify(optionsStub, undefined, 2).replace(
      '"{{stub}}"',
      'extensions'
    );

    const exampleCode = `import { ${this.typeClass}, ${
      this.typeExtensions
    } } from "@blinkk/simple-prose";

const extensions = [
  ${extensionClasses.join(',\r  ')},
];
const editor = new ${
      this.typeClass
    }(document.querySelector('.editor'), ${optionsExample})`;
    this.example.innerHTML = Prism.highlight(
      exampleCode,
      Prism.languages.javascript,
      'javascript'
    );
  }

  showOutput() {
    const prismLanguage = Prism.languages.html;
    const output = this.editor?.value || '';
    const beautiful = html(output);

    this.output.innerHTML = Prism.highlight(
      beautiful,
      prismLanguage,
      this.editor?.language || 'html'
    );
  }
}

class HtmlExampleEditor extends ExampleEditor {
  createEditor() {
    this.editor = new HtmlEditor(
      this.demo,
      Object.assign({}, this.options, {
        extensions: this.extensions,
      })
    ).onUpdate(() => {
      this.showOutput();
    });
  }

  get extensions(): Array<ExtensionComponent> {
    const extensions: Array<ExtensionComponent> = [];
    for (const extConstructor of HtmlExtensions.ALL) {
      // TODO: Determine how to send options for extensions.
      extensions.push(new extConstructor({}));
    }
    return extensions;
  }
}

class MarkdownExampleEditor extends ExampleEditor {
  createEditor() {
    this.editor = new MarkdownEditor(
      this.demo,
      Object.assign({}, this.options, {
        extensions: this.extensions,
      })
    ).onUpdate(() => {
      this.showOutput();
    });
  }

  get extensions(): Array<ExtensionComponent> {
    const extensions: Array<ExtensionComponent> = [];
    for (const extConstructor of MarkdownExtensions.ALL) {
      // TODO: Determine how to send options for extensions.
      extensions.push(new extConstructor({}));
    }
    return extensions;
  }
}

for (const container of document.querySelectorAll(
  '.content_grid__section[data-type-class]'
)) {
  const typeClass = (container as HTMLElement).dataset.typeClass;
  if (typeClass === 'HtmlEditor') {
    new HtmlExampleEditor(container as HTMLElement);
  } else if (typeClass === 'MarkdownEditor') {
    new MarkdownExampleEditor(container as HTMLElement);
  }
}
