const _getEids = (slug: string) => ({
    template: `${slug}-template`,
    close: `${slug}-close`,
    stop: `${slug}-stop`,
    dialog: `${slug}`,
    copy: `${slug}-copy`,
    config: `${slug}-config`,
    preview: `${slug}-preview`,
    panes: `${slug}-panes`,
    meta: `${slug}-meta`,
    status: `${slug}-status`,
});

const _dialogStyles = (eids: ReturnType<typeof _getEids>) => `\
<style>
  #${eids.dialog} {
    max-width: 75vw;
    width: 75vw;
    background: #222;
    color: #fff;
    border: none;
    padding: 20px;
  }
  #${eids.panes} {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
      overflow: hidden;
  }
  #${eids.panes} > div {
      overflow: auto;
      flex: 0 0 50%;
    display: flex;
    flex-flow: column;
    justify-content: space-between; 
      max-height: 80vh;
    }
  #${eids.panes} > div:first-child {
      margin-right: 20px;
    }
  #${eids.meta} {
    background: none;
    padding: 0;
    display: flex;
    flex-flow: column;
      flex: 0 1;
      margin-top: 20px;
      margin-right: 20px;
  }
  #${eids.meta}>* {
    margin: 4px 0;
  }
  #${eids.meta}>button {
    color: #fff;
    padding: 10px;
  }
  #${eids.copy} {
    background: #c00;
    border: none;
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
  #${eids.dialog}[data-error="true"] #${eids.config} {
    border: 2px solid red;
  }
  #${eids.preview} {
    flex: 1;
  }
  #${eids.dialog} pre {
    overflow: auto;
      padding: 20px;
      margin: 0;
    background: #555;
      max-height: 75vh;
  }
  #${eids.config} {
      flex: 1 1 80vh;
      min-height: 100%;
  }
  #${eids.preview} pre {
  }
</style>`;

const _dialogString = (eids: ReturnType<typeof _getEids>) => `
  <template id="${eids.template}">
      <dialog id="${eids.dialog}">
        <div id="${eids.panes}">
          <div>
            <pre id="${eids.config}" contenteditable>
            </pre>
          </div>
          <div>
          <pre id="${eids.preview}">
          </pre>
             <div id="${eids.meta}">
               <div id="${eids.status}"></div>
               <button id="${eids.copy}">Copy</button>
               <button id="${eids.stop}">Stop</button>
               <button id="${eids.close}">Close</button>
             </div>
          </div>
        </div>
      </dialog>
    </template>
    `;