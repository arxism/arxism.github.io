const _getEids = (slug: string) => ({
  template: `${slug}-template`,
  title: `${slug}-title`,
  close: `${slug}-close`,
  stop: `${slug}-stop`,
  dialog: `${slug}`,
  copy: `${slug}-copy`,
  config: `${slug}-config`,
  preview: `${slug}-preview`,
  panes: `${slug}-panes`,
  tabs: `${slug}-tabs`,
  meta: `${slug}-meta`,
  status: `${slug}-status`,
  error: `${slug}-error`,
});

const _dialogStyles = (eids: ReturnType<typeof _getEids>) => `\
<style>
  #${eids.dialog} {
    max-width: 75vw;
    width: 75vw;
    background: #222;
    color: #fff;
    border: none;
    padding: 0 20px 20px 20px;
  }
  #${eids.title} {
    position: absolute;
    right: 20px;
    font-size: 13px;
    opacity: 0.5;
    color: #fff;
  }
  #${eids.panes} {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
      overflow: hidden;
  }
  #${eids.panes} > div {
    flex: 1;
    max-width: 50%;
    max-height: 80vh;
    display: flex;
    flex-flow: column;
    justify-content: space-between; 
    }
  #${eids.panes} > div:first-child {
    flex: 0 0 calc(50% - 20px);
    margin-right: 20px;
    height: 100%;
    }
  #${eids.meta} {
    background: none;
    padding: 0;
    display: flex;
    flex-flow: column;
    flex: 0 1;
  }
  #${eids.meta}>* {
    margin: 4px 0;
  }
  #${eids.meta} > div:first-child {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }
  #${eids.meta}>button {
    color: #fff;
    padding: 10px;
  }
  #${eids.copy} {
    background: #c00;
    border: none;
  }
  #${eids.dialog} button:hover:enabled {
    filter: brightness(1.2);
    cursor: pointer;
  }
  #${eids.copy}:disabled {
    background: #555;
  }
  #${eids.close}, #${eids.stop} {
    background: #222;
    border: 1px solid #444;
  }
  #${eids.stop} {
    display: none;
  }
  #${eids.dialog}[data-loading="true"] #${eids.stop} {
    display: block;
  }
  #${eids.dialog}[data-loading="true"] #${eids.close} {
    display: none;
  }
  #${eids.dialog}[data-error="config"] #${eids.config} {
    border: 2px solid red;
  }
  #${eids.dialog}[data-error="config"] pre {
    mouse-event: none;
  }
  #${eids.preview} {
    flex: 1;
  }
  #${eids.dialog} pre {
    outline: none;
    overflow: auto;
    padding: 20px;
    margin: 0;
    background: #555;
    max-height: 75vh;
    line-height: 1.2;
  }
  #${eids.config} {
    flex: 1 1 80vh;
    min-height: 100%;
  }
  #${eids.preview} pre {
  }
  #${eids.error} {
    color: #c00;
  }
  .${eids.tabs} > button {
    border: none;
    background: none;
    padding: 2px;
  }
  .${eids.tabs} > button:disabled {
    color: #fff;
  }
  .${eids.tabs} > button:enabled {
    font-weight: 700;
    text-decoration: underline;
    color: #fd0000;
  }
</style>`;

const _dialogString = (eids: ReturnType<typeof _getEids>) => `
  <template id="${eids.template}">
      <dialog id="${eids.dialog}">
        <div id="${eids.title}"></div>
        <div id="${eids.panes}">
          <div>
            <div class="${eids.tabs}">
              <button disabled>config</button>
            </div>
            <pre id="${eids.config}" contenteditable>
            </pre>
          </div>
          <div>
            <div class="${eids.tabs}">
              <button disabled>preview</button>
            </div>
            <pre id="${eids.preview}">
            </pre>
            <div id="${eids.meta}">
              <div>
                <div id="${eids.status}"></div>
                <div id="${eids.error}"></div>
              </div>
              <button id="${eids.copy}">Copy</button>
              <button id="${eids.stop}">Stop</button>
              <button id="${eids.close}">Close</button>
            </div>
          </div>
        </div>
      </dialog>
    </template>
    `;
