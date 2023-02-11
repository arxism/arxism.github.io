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
        stop: `${slug}-stop`,
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
  #${eids.close}, #${eids.stop} {
    background: #222;
    border: 1px solid #444;
  }
  #${eids.dialog}[data-error="true"] #${eids.config} {
    border: 2px solid red;
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
	  padding: 20px;
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
  	      <button id="${eids.stop}">Stop</button>
  	      <button id="${eids.close}">Close</button>
  	    </div>
	    </div>
	  </dialog>
	</template>
	`;
    const configString = `
{\n
  "showLegend": true,\n
  "showDate": true,\n
  "showAll": false,\n
  "counts": {\n
    "like": 25,\n
    "love": 50,\n
    "adore": 100,\n
    "fire": 250\n
   },\n
  "escapeOutput": false\n
}\n`;
    let config = JSON.parse(configString);
    let statuses = [];
    const format = (s) => {
        const e = config.escapeOutput ? '\\' : '';
        const { attributes: { created_at: createdAt, path, raw_body: rawBody, likes, comment_count: commentCount } } = s;
        const { counts: { like, love, adore, fire } } = config;
        const popularity = (() => {
            let liked = '';
            let chatty = '';
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
            return [liked, chatty].join(' ');
        })();
        return `${e}> ${rawBody.replaceAll('\n', `\n${e}> `)}\n${e}> ${e}[${createdAt.substring(0, 10)}](https://fetlife.com${path}) ${popularity} \n`;
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
    const date = () => {
        const e = config.escapeOutput ? '\\' : '';
        const dateString = (new Date()).toISOString().substring(0, 10);
        return `${e}### Last updated ${dateString}\n`;
    };
    const list = () => {
        const sorted = statuses
            .filter(st => !st.attributes.only_friends)
            .filter(st => {
            if (config.showAll)
                return st;
            return st.attributes.likes.total > config.counts.like || st.attributes.comment_count > config.counts.like;
        })
            .sort((a, b) => b.attributes.likes.total - a.attributes.likes.total);
        const before = [config.showLegend ? legend() : '', config.showDate ? date() : ''].filter(a => a);
        const strings = sorted.map(format);
        return [...before, ...strings].join('\n');
    };
    const log = (msg) => alert(`FL STATUS INDEX: ${msg}`);
    const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/;
    const perPage = 7;
    const getStatuses = (userId, marker, i) => __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch(`https://fetlife.com/users/${userId}/activity/statuses?per_page=${perPage}${marker ? `&marker=${marker}` : ''}`, {
            "credentials": "include",
            "headers": {
                "User-Agent": navigator.userAgent,
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "If-None-Match": "W/\"466e08437bec06500fe0545665115232\""
            },
            "referrer": `https://fetlife.com/users/${userId}/activity/statuses`,
            "method": "GET",
            "mode": "cors"
        });
        const json = yield resp.json();
        const { stories, no_more: noMore, marker: nextMarker } = json;
        const dialog = document.getElementById(eids.dialog);
        document.querySelector(`#${eids.status}`).innerHTML = `getting statuses... ${perPage * (i !== null && i !== void 0 ? i : 0)}`;
        yield new Promise(resolve => setTimeout(resolve, 1500));
        return (noMore || !nextMarker || !(dialog === null || dialog === void 0 ? void 0 : dialog.open) || dialog.dataset.loading !== 'true') ? stories : [...stories, ...(yield getStatuses(userId, nextMarker, (i !== null && i !== void 0 ? i : 0) + 1))];
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
    const onCopy = () => {
        navigator.clipboard.writeText(list());
        document.querySelector(`#${eids.copy}`).innerHTML = `Copied ✓`;
    };
    const renderDialog = () => {
        var _a, _b;
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
        (_b = dialog.querySelector(`#${eids.stop}`)) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            const d = document.getElementById(eids.dialog);
            d.dataset.loading = "false";
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
        const dialog = document.getElementById(eids.dialog);
        dialog.showModal();
        dialog.dataset.loading = 'true';
        statuses = yield getStatuses(userId);
        updatePreview();
        dialog.dataset.loading = 'false';
        document.getElementById(eids.status).innerHTML = `${statuses.length} statuses found`;
        document.getElementById(eids.copy).addEventListener('click', () => onCopy());
    });
    main();
});
_generateIndex();
