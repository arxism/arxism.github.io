var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _getEids = (slug) => ({
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
const _dialogStyles = (eids) => `\
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
const _dialogString = (eids) => `
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
const _generatePoll = () => __awaiter(this, void 0, void 0, function* () {
    const slug = '_index-poll-dialog';
    const eids = _getEids(slug);
    const configString = `
{\n
  "showNames": true,\n
  "showSummary": true,\n
  "showPrompt": true\n
}\n`;
    let config = JSON.parse(configString);
    let options = [];
    let comments = [];
    const getMaxLength = (options) => {
        const maxLen = {
            ordinal: Math.max(...options.map(o => `${o.ordinal}.`.length)),
            label: Math.max(...options.map(o => o.label.length)),
            short: Math.max(...options.map(o => (o.label.indexOf(':') > -1 ? o.label.split(':')[0] : '').length)),
            count: Math.max(...options.map(o => `${o.voters.length}`.length)),
            bar: 25,
            all: 0,
        };
        maxLen.all = maxLen.ordinal + maxLen.count + maxLen.bar + 6;
        return maxLen;
    };
    const NUMBERS = /\d+/g;
    const getCommentData = (comment) => {
        var _a, _b, _c;
        const content = (new DOMParser()).parseFromString(comment.body, "text/html");
        const firstElement = (_a = content.body.children) === null || _a === void 0 ? void 0 : _a[0];
        const firstLine = `${firstElement.start}. ${firstElement.innerText}`;
        const votes = (_c = (_b = firstLine.match(NUMBERS)) === null || _b === void 0 ? void 0 : _b.map(vote => Number.parseInt(vote))) !== null && _c !== void 0 ? _c : [];
        return Object.assign(Object.assign({}, comment), { votes: [...(new Set(votes))] });
    };
    const getOptionData = (optionLabels) => optionLabels
        .map((label, index) => ({
        ordinal: index + 1,
        label,
        count: 0,
        voters: comments.reduce((votes, comment) => {
            var _a;
            if (((_a = comment.votes) !== null && _a !== void 0 ? _a : []).includes(index + 1)) {
                return [...votes, `[${comment.author.nickname}](https://fetlife.com${comment.meta.path})`];
            }
            return votes;
        }, [])
    }));
    const renderSummary = () => {
        var _a;
        const l = getMaxLength(options);
        const votes = options.reduce((count, option) => count + option.voters.length, 0);
        const voters = [...new Set(options.reduce((voters, option) => [...voters, ...option.voters], []))];
        const title = `─ ${votes} votes from ${voters.length} users ─`;
        const last = (_a = comments === null || comments === void 0 ? void 0 : comments.slice(-1)) === null || _a === void 0 ? void 0 : _a[0];
        if (!last)
            return '- no votes yet';
        const lastCounted = `─ last seen ${last.author.nickname}`;
        return [
            `${title.padEnd(l.all / 2, '-')}`,
            `${lastCounted.padStart(l.all / 2, '-')}`
        ]
            .join('')
            .replace(last.author.nickname, `[${last.author.nickname}](https://fetlife.com${last.meta.path})`);
    };
    const renderData = () => {
        const divmod = (t, b) => [t / b, t % b];
        const maxLen = getMaxLength(options);
        const maxValue = Math.max(...options.map(o => o.count));
        const increment = maxValue / maxLen.bar;
        const str = options.reduce((str, { count, label, ordinal }) => {
            var _a;
            const [barChunks, remainder] = divmod(Number(count * 8 / increment), 8);
            let bar = ''.padStart(barChunks, '█');
            bar += remainder < 1 ? '' : String.fromCharCode('█'.charCodeAt(0) + (8 - remainder));
            const s = {
                ordinal: `* ${ordinal}\\. `.padEnd(maxLen.ordinal, ' '),
                count: String(count).padStart(maxLen.count, '0'),
                label: label.substring(0, maxLen.label).padStart(maxLen.label),
            };
            return [str, s.ordinal, `**${label}**`, '\n', (_a = s.count) !== null && _a !== void 0 ? _a : 0, bar, '\n'].join(' ');
        }, '');
        return str;
    };
    const renderNames = () => {
        return options.reduce((names, { voters, label, ordinal }) => {
            return [names, `* ${ordinal}`, `**${label}**:`, '\n', voters.join(', '), '\n'].join(' ');
        }, '');
    };
    const list = () => {
        const summary = renderSummary();
        const names = renderNames();
        const data = renderData();
        let str = '';
        str += `---`;
        str += `\n## Results`;
        str += `\n\n${data}`;
        if (config.showSummary)
            str += `\n\n${summary}`;
        if (config.showNames)
            str += `\n\n${names}`;
        if (config.showPrompt) {
            str += `\n---`;
            str += `\n### To vote`;
            str += `\n`;
            str += `\n### Voting requires a number. The first line of your reply will be read for your numeric choice(s). Replies will only be tallied if they contain numeric values and only top-level replies are read.`;
        }
        return str;
    };
    const updateConfig = () => {
        var _a, _b, _c;
        let next = config;
        document.querySelector(`#${eids.copy}`).innerHTML = `Copy Poll`;
        try {
            next = JSON.parse((_c = (_b = (_a = document.getElementById(eids.config)) === null || _a === void 0 ? void 0 : _a.innerHTML) === null || _b === void 0 ? void 0 : _b.replaceAll('<br>', ' ').replaceAll('&nbsp;', ' ')) !== null && _c !== void 0 ? _c : '');
            config = next;
            document.querySelector(`#${eids.dialog}`).dataset.error = 'false';
        }
        catch (e) {
            document.querySelector(`#${eids.dialog}`).dataset.error = 'true';
        }
    };
    const updatePreview = () => {
        document.getElementById(eids.preview).innerHTML = list().replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
    };
    const renderDialog = () => {
        var _a, _b;
        document.body.innerHTML += _dialogString(eids);
        document.head.innerHTML += _dialogStyles(eids);
        const template = document.getElementById(eids.template);
        const dialog = template.content.cloneNode(true);
        dialog.querySelector(`#${eids.config}`).innerHTML = configString.replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
        dialog.querySelector(`#${eids.config}`).addEventListener('blur', () => {
            updateConfig();
            updatePreview();
        });
        dialog.querySelector(`#${eids.copy}`).innerHTML = `Copy Poll`;
        (_a = dialog.querySelector(`#${eids.close}`)) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            const d = document.getElementById(eids.dialog);
            if (d)
                document.body.removeChild(d);
        });
        (_b = dialog.querySelector(`#${eids.stop}`)) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            const d = document.getElementById(eids.dialog);
            d.dataset.loading = "false";
        });
        document.body.appendChild(dialog);
        updatePreview();
    };
    const onCopy = () => {
        navigator.clipboard.writeText(list());
        document.querySelector(`#${eids.copy}`).innerHTML = `Copied ✓`;
    };
    const main = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const log = (msg) => alert(`FL POLL: ${msg}`);
        const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)\/posts\/(\d+)\/?/;
        const [_userId, postId] = (_b = (_a = URL_REG.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : [];
        if (!postId)
            return log('Not a writing');
        const pollList = document.querySelector('main .story__copy ol');
        if (!pollList)
            return log('Not a poll');
        const pollOptions = Array.from(pollList.querySelectorAll('li')).map(a => a.innerHTML);
        if (!pollOptions.length)
            return log('No options');
        renderDialog();
        const dialog = document.getElementById(eids.dialog);
        dialog.showModal();
        dialog.dataset.loading = 'true';
        const commentsResp = yield fetch(`https://fetlife.com/comments?content_type=Post&content_id=${postId}&since=0&all=true&vue=true`);
        comments = (yield commentsResp.json()).entries.map(getCommentData);
        comments = comments.filter(c => !c.parent_id);
        options = getOptionData(pollOptions)
            .map(option => (Object.assign(Object.assign({}, option), { count: option.voters.length })))
            .sort((a, b) => b.count - a.count);
        updatePreview();
        dialog.dataset.loading = 'false';
        document.getElementById(eids.status).innerHTML = `${comments.length} comments found`;
        document.getElementById(eids.copy).addEventListener('click', () => onCopy());
    });
    main();
});
_generatePoll();
