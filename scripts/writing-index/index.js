var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _generateIndex = () => __awaiter(this, void 0, void 0, function* () {
    const slug = '_index-dialog';
    const eids = {
        template: `${slug}-template`,
        close: `${slug}-close`,
        dialog: `${slug}`,
        copy: `${slug}-copy`,
        config: `${slug}-config`,
        preview: `${slug}-preview`,
        panes: `${slug}-panes`,
        meta: `${slug}-meta`,
        status: `${slug}-status`,
    };
    const styles = `\
<style>
  #${eids.dialog} {
    max-width: 75vw;
    background: #222;
    color: #fff;
    border: none;
    padding: 20px;
  }
  #${eids.panes} {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
  }
  #${eids.status} {
    flex: 1 0 50%;
  }
  #${eids.meta} {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    padding: 12px;
    display: flex;
    flex-flow: column;
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
  #${eids.close} {
    background: #222;
    border: 1px solid #444;
  }
  #${eids.dialog}[data-error="true"] #${eids.config} {
    border: 2px solid red;
  }
  #${eids.config} {
    margin-right: 10px;
    flex: 0 0 calc(50% - 10px);
  }
  #${eids.preview} {
    flex: 0 0 50%;
  }
  #${eids.dialog} pre {
    overflow: auto;
    background: #555;
    max-height: 70vh;
  }
</style>`;
    const dialogString = `
  <template id="${eids.template}">
	  <dialog id="${eids.dialog}">
	    <div id="${eids.panes}">
	      <pre id="${eids.config}" contenteditable>
	      </pre>
	      <pre id="${eids.preview}">
	      </pre>
  	    <div id="${eids.meta}">
    	    <div id="${eids.status}"></div>
  	      <button id="${eids.copy}">Copy</button>
  	      <button id="${eids.close}">Close</button>
  	    </div>
	    </div>
	  </dialog>
	</template>
	`;
    const configString = `
{\n
  "legend": true,\n
  "noCategories": false,\n
  "noLevels": false,\n
  "categories": [\n
    ["Index", ["index"]],\n
    ["Erotica", ["erotica"]],\n
    ["Photography", ["photography"]],\n
    ["Satire / Parody", ["satire", "parody"]],\n
    ["Poetry", ["poetry", "poem"]],\n
    ["Dominance / submission", ["d-s", "dominant", "dominance", "submission", "dom", "dominate", "domination"]],\n
    ["Polls", ["poll"]],\n
    ["FetLife", ["fetlife"]],\n
    ["General", ["writing", "self-reflection"]]\n
  ],\n
  "order": ["Polls", "General", "FetLife", "Dominance / submission", "Poetry", "Satire / Parody", "Erotica", "Photography", "Misc"],\n
  "challenges": ["WBDC", "#"],\n
  "levels": {\n
    "like": 25,\n
    "love": 50,\n
    "adore": 100,\n
    "fire": 250\n
   },\n
  "escape": false\n
}\n`;
    let config = JSON.parse(configString);
    let writings = [];
    const getChallengeLinks = (html) => {
        const { challenges } = config;
        const document = (new DOMParser()).parseFromString(html, "text/html");
        const links = Array.from(document.querySelectorAll('a'));
        const e = config.escape ? '\\' : '';
        return links.map(l => challenges.some(p => l.innerHTML.trim().startsWith(p)) ? `${e}*${e}[${l.innerHTML}](${l.href})${e}*` : '').filter(a => a);
    };
    const format = (writings, writing) => {
        var _a;
        const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;
        const { escape, noCategories, categories, noLevels, levels: { like, love, adore, fire } } = config;
        const links = getChallengeLinks(body);
        const tagNames = tags.map(t => t.slug);
        const category = categories.reduce((cat, [title, slugs]) => {
            if (noCategories)
                return 'Misc';
            if (cat !== 'Misc')
                return cat;
            return tagNames.some(t => slugs.includes(t)) ? title : cat;
        }, 'Misc');
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
            return noLevels ? '➖' : `${liked}${chatty} `;
        })();
        const e = escape ? '\\' : '';
        return Object.assign(Object.assign({}, writings), { [category]: [
                ...((_a = writings[category]) !== null && _a !== void 0 ? _a : []),
                `${e}* ${createdAt.substring(0, 10)} ${popularity} ${e}[${title}](https://fetlife.com${path}) ${links.join(' ')}`,
            ] });
    };
    const legend = () => {
        const { like, love, adore, fire } = config.levels;
        const e = config.escape ? '\\' : '';
        return `${e}#### Legend\n
\n
${e}* ♥️ 💭 > ${like} loves / comments\n
${e}* ❤️ 💬 > ${love} loves / comments\n
${e}* 💝 🗯️ > ${adore} loves / comments\n
${e}* 🔥 🤯 > ${fire} loves / comments\n`;
    };
    const list = () => {
        const processed = writings.reduce(format, {});
        const e = config.escape ? '\\' : '';
        const cats = config.order
            .filter(category => { var _a; return (_a = processed === null || processed === void 0 ? void 0 : processed[category]) === null || _a === void 0 ? void 0 : _a.length; })
            .map(category => { var _a; return `${e}### ${category}\n\n${((_a = processed[category]) !== null && _a !== void 0 ? _a : []).join('\n')}\n`; });
        const strings = config.legend ? [legend(), ...cats] : cats;
        return strings.join('\n');
    };
    const log = (msg) => alert(`FL WRITING INDEX: ${msg}`);
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
        return (noMore || !nextMarker || !(dialog === null || dialog === void 0 ? void 0 : dialog.open)) ? stories : [...stories, ...(yield getWritings(userId, nextMarker, (i !== null && i !== void 0 ? i : 0) + 1))];
    });
    const updateConfig = () => {
        var _a, _b, _c;
        let next = config;
        document.querySelector(`#${eids.copy}`).innerHTML = `Copy Index`;
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
    const onCopy = (writings) => {
        navigator.clipboard.writeText(list());
        document.querySelector(`#${eids.copy}`).innerHTML = `Copied ✓`;
    };
    const renderDialog = () => {
        var _a;
        document.body.innerHTML += dialogString;
        document.head.innerHTML += styles;
        const template = document.getElementById(eids.template);
        const dialog = template.content.cloneNode(true);
        dialog.querySelector(`#${eids.config}`).innerHTML = configString.replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
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
        document.body.appendChild(dialog);
        updatePreview();
    };
    const main = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const [userId] = (_b = (_a = URL_REG.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : [];
        if (!userId)
            return log('Not on user page');
        renderDialog();
        document.getElementById(eids.dialog).showModal();
        writings = yield getWritings(userId);
        updatePreview();
        document.getElementById(eids.status).innerHTML = `${writings.length} writings found`;
        document.getElementById(eids.copy).addEventListener('click', () => onCopy(writings));
    });
    main();
});
_generateIndex();
