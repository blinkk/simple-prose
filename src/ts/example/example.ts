import * as HtmlExtensions from '../editor/html';
import * as MarkdownExtensions from '../editor/markdown';

import {
  EditorComponent,
  EditorConstructor,
  EditorOptions,
} from '../editor/editor';

import {HtmlEditor} from '../editor/htmlEditor';
import {MarkdownEditor} from '../editor/markdownEditor';
import Prism from 'prismjs';
import {ExtensionComponent} from '../editor/extension';

const EDITORS: Array<EditorConstructor> = [HtmlEditor, MarkdownEditor];

/**
 * Understands the structure of the editor page and crafts the example experience
 * and edtiors for testing.
 */
class ExampleEditor {
  container: HTMLElement;
  demo: HTMLElement;
  editor?: EditorComponent;
  example: HTMLElement;
  extensions: Array<ExtensionComponent>;
  options: EditorOptions;
  output: HTMLElement;
  typeClass: string;

  constructor(container: HTMLElement) {
    this.container = container;
    this.typeClass = this.container.dataset.typeClass as string;
    this.options = JSON.parse(this.container.dataset.typeOptions || '{}');
    this.demo = container.querySelector('.editor__demo') as HTMLElement;
    this.extensions = HtmlExtensions.ALL;
    this.output = container.querySelector(
      '.editor__output code'
    ) as HTMLElement;
    this.example = container.querySelector(
      '.editor__example code'
    ) as HTMLElement;

    for (const editor of EDITORS) {
      if (this.typeClass === editor.name) {
        this.editor = new editor(this.demo, this.options);
        break;
      }
    }

    if (!this.editor) {
      console.error('Unable to determine class for the example.');
      return;
    }

    // Determine which extensions to use.
    if (this.editor.language === 'markdown') {
      this.extensions = MarkdownExtensions.ALL;
    }

    this.showExample();
    this.showOutput();
  }

  showExample() {
    const exampleCode = `import { ${
      this.typeClass
    } } from "@blinkk/simple-prose";

const editor = new ${
      this.typeClass
    }(document.querySelector('.editor'), ${JSON.stringify(
      this.options,
      undefined,
      2
    )})`;
    this.example.innerHTML = Prism.highlight(
      exampleCode,
      Prism.languages.javascript,
      'javascript'
    );
  }

  showOutput() {
    const prismLanguage = Prism.languages.html;

    const output = '<p>Test</p>';

    this.output.innerHTML = Prism.highlight(
      output,
      prismLanguage,
      this.editor?.language || 'html'
    );
  }
}

for (const container of document.querySelectorAll(
  '.content_grid__section[data-type-class]'
)) {
  new ExampleEditor(container as HTMLElement);
}
