const { load } = await import(`../../utils/load.js?_v=${Date.now()}`) as typeof import('../../utils/load.js');

export const eid = {
  dialog: '#__arx-dialog',
  title: '#__arx-title',
  close: '#__arx-close',
  panels: '#__arx-panels',
  panel: '.__arx-panel',
  tabs: '.__arx-pane-tabs',
  tab: '.__arx-pane-tab',
  status: '.__arx-status',
  error: '.__arx-error',
  message: '.__arx-message',
  content: '.__arx-content',
  left: '.__arx-left',
  right: '.__arx-right',
  actions: '.__arx-actions',
  actionButton: '.__arx-actionButton',
  stop: '.__arx-action-stop',
  scan: '.__arx-action-scan',
} as const;

const setupTabs = (dialog: HTMLDialogElement) => {
  const onTabClick = (e: Event) => {
    if (e.target instanceof HTMLButtonElement && dialog) {
      const parent = e.target.parentElement as HTMLDivElement;
      const pos = parent.dataset.position ?? '';
      const panels = Array.from(dialog.querySelectorAll(eid.panel)) as HTMLDivElement[];
      const tabs = parent.querySelectorAll(eid.tab);
      const paneName = e.target.dataset.pane ?? '';
      tabs.forEach(tab => {
        if (tab instanceof HTMLButtonElement) {
          Array.from(panels).forEach(panel => {
            if (panel.dataset.pane === paneName) {
              panel.dataset[pos] = '';
            } else if (panel.dataset[pos] === "") {
              delete panel.dataset[pos];
            }
          });
          if (paneName === tab.dataset.pane) {

            tab.setAttribute('disabled', '');
          } else {
            tab.removeAttribute('disabled');
          }

        }
      });
      dialog.dataset.pane = paneName;
    }
  }

  const tabs = dialog.querySelectorAll(eid.tab) as NodeListOf<HTMLDivElement>;
  tabs.forEach(tab => {
    tab.addEventListener('click', onTabClick);
  });
  const [left, right] = Array.from(dialog.querySelectorAll(eid.tabs));
  (left?.querySelector('[data-position="left"]') as HTMLButtonElement)?.click();
  (right?.querySelector('[data-position="right"]') as HTMLButtonElement)?.click();
};

export interface RenderDialogProps {
  title: string;
  panes: {
    title: string;
    content?: string;
    onBlur?: EventListener;
    status?: string;
    error?: string;
    position?: "right" | "left";
    actions?: {
      title: string;
      onClick?: EventListener;
      className?: string;
    }[];
  }[];
}

export interface DialogRenderMap<PANELS extends string> {
  root: HTMLDialogElement,
  panel: Record<PANELS, HTMLDivElement>,
  close: HTMLButtonElement,
  title: HTMLDivElement,
  eid: typeof eid,
}

export const render = async <PANELS extends string>(props: RenderDialogProps): Promise<DialogRenderMap<PANELS>> => {
  await load("https://arxism.github.io/bbx/components/dialog/index.css");
  const mark = (element: HTMLElement, ids: string) => {
    const [type, id] = [ids.slice(0, 1), ids.slice(1)];
    if (type === '.') {
      element.classList.add(id);
    } else {
      element.setAttribute('id', id);
    }
  }
  const dialog = document.createElement('dialog');
  mark(dialog, eid.dialog);
  dialog.dataset.loading = "";

  const title = document.createElement('div');
  mark(title, eid.title);
  title.innerHTML = props.title;
  dialog.appendChild(title);

  const close = document.createElement('button');
  close.innerHTML = 'close';
  mark(close, eid.close);
  close.addEventListener('click', () => {
    dialog.close();
  })
  dialog.appendChild(close);

  const tabsLeft = document.createElement('div');
  tabsLeft.dataset.position = 'left';
  const tabsRight = document.createElement('div');
  tabsRight.dataset.position = 'right';
  [tabsLeft, tabsRight].forEach(t => mark(t, eid.tabs));
  const panels = document.createElement('div');;
  mark(panels, eid.panels);
  const panes = props.panes.reduce((panes, pane) => {
    const tab = document.createElement('button');
    tab.dataset.pane = pane.title;
    mark(tab, eid.tab);
    tab.innerHTML = pane.title;

    const container = document.createElement('div');
    mark(container, eid.panel);
    if (pane.position === "right") {
      container.dataset.position = 'right';
      tab.dataset.position = 'right';
      tabsRight.appendChild(tab.cloneNode(true));
    }
    if (pane.position === "left") {
      tab.dataset.position = "left";
      container.dataset.position = 'left';;
    }
    tabsLeft.appendChild(tab.cloneNode(true));
    container.dataset.pane = pane.title;


    const content = document.createElement('pre');
    mark(content, eid.content);
    if (pane.content) content.innerHTML = pane.content;
    if (pane.onBlur) content.addEventListener('blur', pane.onBlur);
    container.appendChild(content);

    const message = document.createElement('div');
    message.innerHTML = `<div class="${eid.status.slice(1)}"></div><div class="${eid.error.slice(1)}"></div>`;
    mark(message, eid.message);
    container.appendChild(message);

    const actions = document.createElement('div');
    mark(actions, eid.actions);
    pane.actions?.forEach(action => {
      const button = document.createElement('button');
      mark(button, eid.actionButton);
      if (action.className) button.classList.add(action.className);
      if (action.onClick) button.addEventListener('click', action.onClick);
      button.innerHTML = action.title;
      actions.appendChild(button);
    })
    container.appendChild(actions);
    if (panels instanceof HTMLDivElement) panels.appendChild(container);
    return { ...panes, [pane.title]: container };
  }, {} as DialogRenderMap<PANELS>['panel'])
  dialog.appendChild(tabsLeft);
  dialog.appendChild(tabsRight);
  dialog.appendChild(panels);

  setupTabs(dialog);
  document.body.appendChild(dialog);

  dialog.addEventListener('close', () => {
    document.body.removeChild(dialog);
  })

  const mql = window.matchMedia("(max-width: 800px)");

  const onMq = (matches: boolean) => {
    if (matches) {
      dialog.dataset.mobile = 'true';
    } else {
      delete dialog.dataset.mobile;
    }
  }
  mql.addEventListener("change", e => onMq(e.matches));
  onMq(mql.matches);

  return {
    root: dialog,
    title: title,
    close: close,
    panel: panes,
    eid,
  };
}
