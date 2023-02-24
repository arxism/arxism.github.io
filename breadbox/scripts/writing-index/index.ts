const nc = (f: string) => `${f}?_v=${Date.now()}`;
const { render: renderDialog, eid: dialogEid } = await import(nc('../../components/dialog/index.js')) as typeof import('../../components/dialog/index.js');
const { getURLParams } = await import(nc('../../utils/url.js')) as typeof import('../../utils/url.js');
const { version } = await import(nc('../index.js')) as typeof import('../index.js');
const { config: initialConfig } = await import(nc("./config.js")) as typeof import("./config.js");
const { list, updateConfig, updatePreview, getWritings, renderWritings } = await import(nc('./lib.js')) as typeof import('./lib.js');
import type { WritingIndexConfig as Config } from './config.js';
import type { Writing } from './lib.js';
import type { DialogRenderMap } from '../../components/Dialog';

type PANES = 'config' | 'writings' | 'index' | 'help';
export interface Context {
  eid: {},
  config: Config,
  writings: Writing[],
  dialog: DialogRenderMap<PANES>,
}

(async () => {
  let c: Context = {
    config: {
      ...initialConfig
    },
    writings: [],
    eid: {},
    dialog: null,
  };

  const help = `This is a writing indexer. WIP`

  const scanForWritings = async (_e: Event) => {
    const { root, panel, eid } = c.dialog;
    const { userId } = getURLParams();
    panel.writings.querySelector(eid.content)!.innerHTML = '';
    root.dataset.loading = "true";
    c.writings = userId ? await getWritings(c, userId) : [];
    updatePreview(panel.index.querySelector(eid.content), c)
    root.dataset.loading = '';
    panel.writings.querySelector(eid.status)!.innerHTML = `${c.writings.length} writings found`;
    panel.writings.querySelector(eid.content)!.innerHTML = renderWritings(c.writings);
  }

  const stopScanning = () => {
    c.dialog.root.dataset.loading = "";
  }

  const onCopy = (event: Event) => {
    navigator.clipboard.writeText(list(c));
    if (event.target instanceof HTMLButtonElement) {
      event.target.innerHTML = `Copied ✓`;
    }
  };

  c.dialog = await renderDialog({
    title: `@Arx's writing-index ${version}`,
    panes: [
      {
        title: "config",
        position: "left",
        content: JSON.stringify(c.config, null, 2)?.replaceAll("<br>", " ").replaceAll("&nbsp;", " ") ?? "",
      },
      {
        title: 'writings',
        position: 'right',
        content: '[No Writings]',
        actions: [
          {
            title: 'Scan for Writings',
            className: dialogEid.scan.slice(1),
            onClick: scanForWritings,
          },
          {
            title: 'Stop Scanning',
            className: dialogEid.stop.slice(1),
            onClick: stopScanning,
          }

        ]
      },
      {
        title: "index",
        content: "[No Writings]",
        position: "right",
        status: '',
        error: '',
        actions: [
          {
            title: "Copy to Clipboard",
            onClick: onCopy,
          },
        ],
      },
      {
        title: "help",
        content: help,
        position: "left",
        status: '',
        error: '',
      }],
  });

  const { root, panel, eid } = c.dialog;
  const { userId } = getURLParams();
  panel.config.querySelector(eid.content).setAttribute('contenteditable', 'true');
  panel.config.querySelector(eid.content).addEventListener('blur', () => {
    updateConfig(panel.config.querySelector(eid.content), c);
    updatePreview(panel.index.querySelector(eid.content), c)
  });

  if (!userId) {
    const error = "not on a user page";
    panel.writings.querySelector(eid.error)!.innerHTML = error;
    panel.writings.querySelector(eid.scan)?.setAttribute('disabled', 'true');
    panel.writings.querySelector(eid.scan)?.setAttribute('title', error);
  }
  root.showModal();
})()


