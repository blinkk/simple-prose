import * as HtmlExtensions from '../extensions/html';
import * as MarkdownExtensions from '../extensions/markdown';

import {EditorComponent, EditorOptions} from '../editor/editor';

import {ExtensionConstructor} from '../extensions/extension';
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

  get extensions(): Array<ExtensionConstructor> {
    return [];
  }

  showExample() {
    const exampleCode = `import { ${this.typeClass}, ${
      this.typeExtensions
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
    this.editor = new HtmlEditor(this.demo, {
      extensions: [new HtmlExtensions.StrongExtension()],
    }).onUpdate(() => {
      this.showOutput();
    });
  }

  get extensions(): Array<ExtensionConstructor> {
    return HtmlExtensions.ALL;
  }
}

class MarkdownExampleEditor extends ExampleEditor {
  createEditor() {
    this.editor = new MarkdownEditor(this.demo, {
      extensions: [new MarkdownExtensions.StrongExtension()],
    }).onUpdate(() => {
      this.showOutput();
    });
  }

  get extensions(): Array<ExtensionConstructor> {
    return MarkdownExtensions.ALL;
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
