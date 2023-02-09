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
    var _a, _b;
    const configString = `
    {\n
        "noCategories": false,\n
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
        "noLevels": false,\n
        "levels": {\n
         "like": 25,\n
         "love": 50,\n
         "adore": 100,\n
         "fire": 250\n
        }\n
    }\n
	`;
    const eids = {
        close: '_index-dialog-close',
        dialog: '_index-dialog',
        copy: '_index-dialog-copy',
        config: '_index-dialog-config'
    };
    let config = JSON.parse(configString);
    const getChallengeLinks = (html) => {
        const { challenges } = config;
        const document = (new DOMParser()).parseFromString(html, "text/html");
        const links = Array.from(document.querySelectorAll('a'));
        return links.map(l => challenges.some(p => l.innerHTML.trim().startsWith(p)) ? `*[${l.innerHTML}](${l.href})*` : '').filter(a => a);
    };
    const format = (writings, writing) => {
        var _a;
        const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;
        const { noCategories, categories, noLevels, levels: { like, love, adore, fire } } = config;
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
        return Object.assign(Object.assign({}, writings), { [category]: [
                ...((_a = writings[category]) !== null && _a !== void 0 ? _a : []),
                `* ${createdAt.substring(0, 10)} ${popularity} [${title}](https://fetlife.com${path}) ${links.join(' ')}`,
            ] });
    };
    const list = (writings) => {
        const processed = writings.reduce(format, {});
        const strings = config.order
            .filter(category => { var _a; return (_a = processed === null || processed === void 0 ? void 0 : processed[category]) === null || _a === void 0 ? void 0 : _a.length; })
            .map(category => { var _a; return `### ${category}\n\n${((_a = processed[category]) !== null && _a !== void 0 ? _a : []).join('\n')}\n`; });
        return strings.join('\n');
    };
    const log = (msg) => alert(`FL WRITING INDEX: ${msg}`);
    const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/;
    const [userId] = (_b = (_a = URL_REG.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : [];
    if (!userId)
        return log('Not on user page');
    const renderDialog = ({ showConfig, buttonText, buttonFn = () => { }, text }, open) => {
        var _a, _b;
        const dialog = document.createElement('dialog');
        dialog.setAttribute('id', eids.dialog);
        dialog.setAttribute('style', "position: relative;background: #222;color: #fff;border: none;display: flex;flex-direction: column;padding: 20px;");
        const buttonStyle = "border: none;background: #c00;color: #fff;padding: 10px;margin-top: 12px;";
        let innerHTML = `${text}`;
        if (showConfig) {
            innerHTML += `<details style="margin: 20px 0;width: 500px;"><summary>config</summary><pre contenteditable style="max-height: 50vh;overflow: auto;line-height: initial;" id="${eids.config}">
			${configString.replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;')}
			</pre></details>`;
        }
        if (buttonText) {
            innerHTML += `<button style="${buttonStyle}" id="${eids.copy}">${buttonText}</button>`;
        }
        innerHTML += `<button id="${eids.close}" style="${buttonStyle}">Close</button>`;
        dialog.innerHTML = innerHTML;
        const old = document.getElementById(eids.dialog);
        if (old) {
            document.body.replaceChild(dialog, old);
        }
        else {
            document.body.appendChild(dialog);
        }
        (_a = document.getElementById(eids.copy)) === null || _a === void 0 ? void 0 : _a.addEventListener('click', buttonFn);
        (_b = document.getElementById(eids.close)) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => dialog.close());
        if (open) {
            dialog.showModal();
        }
        else {
            dialog.close();
        }
        return dialog;
    };
    const perPage = 7;
    const getWritings = (marker, i) => __awaiter(this, void 0, void 0, function* () {
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
        const dialog = renderDialog({ text: `getting writings... ${perPage * (i !== null && i !== void 0 ? i : 0)}` }, true);
        yield new Promise(resolve => setTimeout(resolve, 1500));
        return (noMore || !nextMarker || !dialog.open) ? stories : [...stories, ...(yield getWritings(nextMarker, (i !== null && i !== void 0 ? i : 0) + 1))];
    });
    const writings = yield getWritings();
    const onCopy = () => {
        var _a, _b, _c;
        let nextConfig = config;
        try {
            nextConfig = JSON.parse((_c = (_b = (_a = document.getElementById(eids.config)) === null || _a === void 0 ? void 0 : _a.innerHTML) === null || _b === void 0 ? void 0 : _b.replaceAll('<br>', ' ').replaceAll('&nbsp;', ' ')) !== null && _c !== void 0 ? _c : '');
            config = nextConfig;
        }
        catch (e) {
            const dialog = document.getElementById(eids.dialog);
            if (dialog) {
                renderDialog({ showConfig: true, text: `${writings.length} writings found`, buttonText: `Copy Index`, buttonFn: onCopy }, true);
                alert('config error');
            }
            return;
        }
        navigator.clipboard.writeText(list(writings));
        renderDialog({ showConfig: true, text: `${writings.length} writings found`, buttonText: `Copied ✓`, buttonFn: onCopy }, true);
    };
    renderDialog({ showConfig: true, text: `${writings.length} writings found`, buttonText: `Copy Index`, buttonFn: onCopy }, true);
});
_generateIndex();
