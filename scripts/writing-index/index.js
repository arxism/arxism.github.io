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
const _dialogStyles = (eids) => `\
<style>
  #${eids.dialog} {
    max-width: 75vw;
    width: 75vw;
    background: #222;
    color: #fff;
    border: none;
    padding: 10px 20px 20px 20px;
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
    margin-top: 20px;
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
    border: 2px solid transparent;
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
const _dialogString = (eids) => `
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
const _generateIndex = () => __awaiter(this, void 0, void 0, function* () {
    const slug = '_index-writing-dialog';
    const eids = _getEids(slug);
    const version = "v1.0.0";
    const title = `writing-index ${version}`;
    let config = {
        showLegend: true,
        showCategories: false,
        showCounts: true,
        category: {
            tags: {
                index: ["index"],
                erotica: ["erotica"],
                photography: ["photography"],
                satire: ["satire", "parody"],
                poetry: ["poetry", "poem"],
                ds: ["d-s", "dominant", "dominance", "submission", "dom", "dominate", "domination"],
                polls: ["poll"],
                fetlife: ["fetlife"],
                general: ["writing", "self-reflection"]
            },
            order: {
                polls: "Polls",
                general: "General",
                fetlife: "FetLife",
                ds: "Dominance / submission",
                poetry: "Poetry",
                satire: "Satire / Parody",
                erotica: "Erotica",
                photography: "Photography",
                misc: "Misc"
            }
        },
        hashtags: ["WBDC", "#"],
        counts: {
            like: 25,
            love: 50,
            adore: 100,
            fire: 250
        },
        escapeOutput: false
    };
    let writings = [];
    const getChallengeLinks = (html) => {
        const { hashtags, escapeOutput } = config;
        const document = (new DOMParser()).parseFromString(html, "text/html");
        const links = Array.from(document.querySelectorAll('a'));
        const e = escapeOutput ? '\\' : '';
        return links.map(l => hashtags.some(p => l.innerHTML.trim().startsWith(p)) ? `${e}*${e}[${l.innerHTML}](${l.href})${e}*` : '').filter(a => a);
    };
    const format = (writings, writing) => {
        var _a, _b;
        const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;
        const { escapeOutput, showCategories, category, showCounts, counts: { like, love, adore, fire } } = config;
        const links = getChallengeLinks(body);
        const tagNames = tags.map(t => t.slug);
        const cat = Object.entries((_a = category === null || category === void 0 ? void 0 : category.tags) !== null && _a !== void 0 ? _a : []).reduce((cat, [id, ctags]) => {
            if (!showCategories)
                return 'misc';
            if (cat !== 'misc')
                return cat;
            return tagNames.some(t => ctags.includes(t)) ? id : cat;
        }, 'misc');
        const popularity = (() => {
            let liked = '➖';
            let chatty = '➖';
            if (likes.total >= like)
                liked = '♥️';
            if (likes.total >= love)
                liked = '❤️';
            if (likes.total >= adore)
                liked = '💝';
            if (likes.total >= fire)
                liked = '🔥';
            if (commentCount >= like)
                chatty = '💭';
            if (commentCount >= love)
                chatty = '💬';
            if (commentCount >= adore)
                chatty = '🗯️';
            if (commentCount >= fire)
                chatty = '🤯';
            return showCounts ? `${liked}${chatty}` : '➖';
        })();
        const e = escapeOutput ? '\\' : '';
        return Object.assign(Object.assign({}, writings), { [cat]: [
                ...((_b = writings[cat]) !== null && _b !== void 0 ? _b : []),
                `${e}* ${createdAt.substring(0, 10)} ${popularity} ${e}[${title}](https://fetlife.com${path}) ${links.join(' ')}`,
            ] });
    };
    const legend = () => {
        const { like, love, adore, fire } = config.counts;
        const e = config.escapeOutput ? '\\' : '';
        return `${e}#### Legend\n
\n
${e}* ♥️ 💭 > ${like} loves / comments\n
${e}* ❤️ 💬 > ${love} loves / comments\n
${e}* 💝 🗯️ > ${adore} loves / comments\n
${e}* 🔥 🤯 > ${fire} loves / comments\n`;
    };
    const list = () => {
        const processed = writings.filter(w => !w.attributes.only_friends).reduce(format, {});
        const e = config.escapeOutput ? '\\' : '';
        const cats = Object.entries(config.category.order)
            .filter(([id]) => { var _a; return (_a = processed === null || processed === void 0 ? void 0 : processed[id]) === null || _a === void 0 ? void 0 : _a.length; })
            .map(([id, name]) => { var _a; return `${e}### ${name}\n\n${((_a = processed[id]) !== null && _a !== void 0 ? _a : []).join('\n')}\n`; });
        const strings = config.showLegend ? [legend(), ...cats] : cats;
        return strings.join('\n');
    };
    const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/;
    const perPage = 7;
    const getWritings = (userId, marker, i) => __awaiter(this, void 0, void 0, function* () {
        const writingsResp = yield fetch(`https://fetlife.com/users/${userId}/activity/writings?per_page=${perPage}${marker ? `&marker=${marker}` : ''}`, {
            "credentials": "include",
            "headers": {
                "User-Agent": navigator.userAgent,
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": `https://fetlife.com/users/${userId}/activity/writings`,
            "method": "GET",
            "mode": "cors"
        });
        const json = yield writingsResp.json();
        const { stories, no_more: noMore, marker: nextMarker } = json;
        console.log(`waiting ${nextMarker}`);
        const dialog = document.getElementById(eids.dialog);
        document.querySelector(`#${eids.status}`).innerHTML = `getting writings... ${perPage * (i !== null && i !== void 0 ? i : 0)}`;
        yield new Promise(resolve => setTimeout(resolve, 1500));
        return (noMore || !nextMarker || !(dialog === null || dialog === void 0 ? void 0 : dialog.open) || dialog.dataset.loading !== 'true') ? stories : [...stories, ...(yield getWritings(userId, nextMarker, (i !== null && i !== void 0 ? i : 0) + 1))];
    });
    const updateConfig = () => {
        var _a, _b, _c;
        let next = config;
        document.querySelector(`#${eids.copy}`).innerHTML = `Copy Index`;
        try {
            next = JSON.parse((_c = (_b = (_a = document.getElementById(eids.config)) === null || _a === void 0 ? void 0 : _a.innerHTML) === null || _b === void 0 ? void 0 : _b.replaceAll('<br>', ' ').replaceAll('&nbsp;', ' ')) !== null && _c !== void 0 ? _c : '');
            config = next;
            document.querySelector(`#${eids.dialog}`).dataset.error = '';
        }
        catch (e) {
            document.querySelector(`#${eids.dialog}`).dataset.error = 'config';
        }
    };
    const updatePreview = () => {
        document.getElementById(eids.preview).innerHTML = list().replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
    };
    const onCopy = () => {
        navigator.clipboard.writeText(list());
        document.querySelector(`#${eids.copy}`).innerHTML = `Copied ✓`;
    };
    const renderDialog = () => {
        var _a, _b;
        document.body.innerHTML += _dialogString(eids);
        document.head.innerHTML += _dialogStyles(eids);
        const template = document.getElementById(eids.template);
        const dialog = template.content.cloneNode(true);
        dialog.querySelector(`#${eids.title}`).innerHTML = title;
        dialog.querySelector(`#${eids.config}`).innerHTML = JSON.stringify(config, null, 2).replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
        dialog.querySelector(`#${eids.config}`).addEventListener('blur', () => {
            updateConfig();
            updatePreview();
        });
        dialog.querySelector(`#${eids.copy}`).innerHTML = `Copy Index`;
        (_a = dialog.querySelector(`#${eids.close}`)) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            const d = document.getElementById(eids.dialog);
            if (d)
                document.body.removeChild(d);
        });
        (_b = dialog.querySelector(`#${eids.stop}`)) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            const d = document.getElementById(eids.dialog);
            d.dataset.loading = "";
        });
        document.body.appendChild(dialog);
        updatePreview();
    };
    const main = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        renderDialog();
        const [userId] = (_b = (_a = URL_REG.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : [];
        if (!userId) {
            document.querySelector(`#${eids.dialog}`).dataset.error = 'true';
            document.querySelector(`#${eids.copy}`).disabled = true;
            document.querySelector(`#${eids.error}`).innerHTML = 'Not on a user page';
        }
        const dialog = document.getElementById(eids.dialog);
        dialog.showModal();
        dialog.dataset.loading = 'true';
        writings = dialog.dataset.error ? [] : yield getWritings(userId);
        updatePreview();
        dialog.dataset.loading = '';
        document.getElementById(eids.status).innerHTML = `${writings.length} writings found`;
        document.getElementById(eids.copy).addEventListener('click', () => onCopy());
    });
    main();
});
_generateIndex();
