import {EditorState, Plugin} from 'prosemirror-state';
import {Command} from 'prosemirror-commands';
import {EditorView} from 'prosemirror-view';

export interface PluginViewComponent {
  update?: (view: EditorView, prevState: EditorState) => void;
  destroy?: () => void;
}

/**
 * Definition for an extension
 */
export interface MenuIcon {
  /**
   * Icon name to use. Expected to be a material icon names.
   */
  icon?: string;
  /**
   * Url for an image to use as the icon.
   */
  url?: string;
  /**
   * SVG source string to use as an inline svg icon.
   */
  svg?: string;
  /**
   * Text to use instead of a normal icon.
   */
  text?: string;
}

/**
 * Controls how the extension is shown in the menu.
 */
export interface MenuOptions {
  /**
   * Command handler for when the menu item is clicked.
   */
  command: Command;
  /**
   * Icon for the menu item.
   */
  icon: MenuIcon;
  /**
   * Label for the menu item.
   */
  label: string;
}

/**
 * Created the menu plugin from the provided menu items.
 *
 * @param items Menu items to show.
 * @returns ProseMirror plugin that shows the menu.
 */
export function menuPlugin(items: Array<MenuOptions>) {
  return new Plugin({
    view(editorView) {
      const menuView = new MenuView(items, editorView);
      editorView.dom.parentNode?.insertBefore(menuView.dom, editorView.dom);
      return menuView;
    },
  });
}

export class MenuView implements PluginViewComponent {
  dom: HTMLElement;
  editorView: EditorView;
  menuItems: Array<MenuItem>;

  constructor(items: Array<MenuOptions>, editorView: EditorView) {
    this.editorView = editorView;

    this.dom = document.createElement('div');
    this.dom.classList.add('sp__menu__bar');

    this.menuItems = [];
    for (const item of items) {
      const menuItem = new MenuItem(item);
      this.dom.appendChild(menuItem.dom);
      this.menuItems.push(menuItem);
    }

    this.update();

    this.dom.addEventListener('mousedown', e => {
      e.preventDefault();
      editorView.focus();
      for (const menuItem of this.menuItems) {
        if (menuItem.dom.contains(e.target as HTMLElement)) {
          menuItem.options.command(
            editorView.state,
            editorView.dispatch,
            editorView
          );
        }
      }
    });
  }

  update() {
    for (const menuItem of this.menuItems) {
      const active = menuItem.options.command(
        this.editorView.state,
        undefined,
        this.editorView
      );
      menuItem.dom.style.display = active ? '' : 'none';
    }
  }

  destroy() {
    this.dom.remove();
  }
}

export class MenuItem {
  dom: HTMLElement;
  options: MenuOptions;

  constructor(options: MenuOptions) {
    this.options = options;
    this.dom = document.createElement('div');
    this.dom.classList.add('sp__menu__item');
    this.dom.dataset.label = this.options.label;

    // Support different icon types.
    if (this.options.icon.icon) {
      const materialIcon = document.createElement('span');
      materialIcon.classList.add('material-icons');
      materialIcon.textContent = this.options.icon.icon;
      this.dom.appendChild(materialIcon);
    } else if (this.options.icon.svg) {
      this.dom.innerHTML = this.options.icon.svg;
    } else if (this.options.icon.url) {
      const iconImg = document.createElement('img');
      iconImg.src = this.options.icon.url;
      iconImg.alt = this.options.label;
      this.dom.appendChild(iconImg);
    } else {
      this.dom.textContent = this.options.icon.text || '';
    }
  }
}
