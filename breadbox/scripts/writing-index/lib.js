export const getChallengeLinks = (html, c) => {
    const { hashtags, escapeOutput } = c.config;
    const document = new DOMParser().parseFromString(html, "text/html");
    const links = Array.from(document.querySelectorAll("a"));
    const e = escapeOutput ? "\\" : "";
    return links
        .map((l) => hashtags.some((p) => l.innerHTML.trim().startsWith(p))
        ? `${e}*${e}[${l.innerHTML}](${l.href})${e}*`
        : "")
        .filter((a) => a);
};
export const format = (writings, writing, c) => {
    const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes, }, } = writing;
    const { escapeOutput, showCategories, category, showCounts, counts: { like, love, adore, fire }, } = c.config;
    const links = getChallengeLinks(body, c);
    const tagNames = tags.map((t) => t.slug);
    const cat = Object.entries(category?.tags ?? []).reduce((cat, [id, ctags]) => {
        if (!showCategories)
            return "misc";
        if (cat !== "misc")
            return cat;
        return tagNames.some((t) => ctags.includes(t)) ? id : cat;
    }, "misc");
    const popularity = (() => {
        let liked = "➖";
        let chatty = "➖";
        if (likes.total >= like)
            liked = "♥️";
        if (likes.total >= love)
            liked = "❤️";
        if (likes.total >= adore)
            liked = "💝";
        if (likes.total >= fire)
            liked = "🔥";
        if (commentCount >= like)
            chatty = "💭";
        if (commentCount >= love)
            chatty = "💬";
        if (commentCount >= adore)
            chatty = "🗯️";
        if (commentCount >= fire)
            chatty = "🤯";
        return showCounts ? `${liked}${chatty}` : "➖";
    })();
    const e = escapeOutput ? "\\" : "";
    return {
        ...writings,
        [cat]: [
            ...(writings[cat] ?? []),
            `${e}* ${createdAt.substring(0, 10)} ${popularity} ${e}[${title}](https://fetlife.com${path}) ${links.join(" ")}`,
        ],
    };
};
export const legend = (c) => {
    const { like, love, adore, fire } = c.config.counts;
    const e = c.config.escapeOutput ? "\\" : "";
    return `${e}#### Legend
\n
${e}* ♥️ 💭 > ${like} loves / comments
${e}* ❤️ 💬 > ${love} loves / comments
${e}* 💝 🗯️ > ${adore} loves / comments
${e}* 🔥 🤯 > ${fire} loves / comments\n`;
};
export const list = (c) => {
    const processed = c.writings
        .filter((w) => !w.attributes.only_friends)
        .reduce((ws, w) => format(ws, w, c), {});
    const e = c.config.escapeOutput ? "\\" : "";
    const cats = Object.entries(c.config.category.order)
        .filter(([id]) => processed?.[id]?.length)
        .map(([id, name]) => `${e}### ${name}\n\n${(processed[id] ?? []).join("\n")}\n`);
    const strings = c.config.showLegend ? [legend(c), ...cats] : cats;
    return strings.join("\n");
};
export const getWritings = async (c, userId, marker = "", count = 0) => {
    const { root, panel } = c.dialog;
    const perPage = 7;
    const writingsResp = await fetch(`https://fetlife.com/users/${userId}/activity/writings?per_page=${perPage}${marker ? `&marker=${marker}` : ""}`, {
        credentials: "include",
        headers: {
            "User-Agent": navigator.userAgent,
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        },
        referrer: `https://fetlife.com/users/${userId}/activity/writings`,
        method: "GET",
        mode: "cors",
    });
    const json = await writingsResp.json();
    const { stories, no_more: noMore, marker: nextMarker } = json;
    const total = count + stories.length;
    console.log(`waiting ${nextMarker}`);
    panel.writings.querySelector(c.dialog.eid.content).innerHTML += renderWritings(stories);
    panel.writings.querySelector(c.dialog.eid.status).innerHTML = `getting writings... ${total}`;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return noMore ||
        !nextMarker ||
        !root?.open ||
        root.dataset.loading !== "true"
        ? stories
        : [...stories, ...(await getWritings(c, userId, nextMarker, total))];
};
export const updateConfig = (pre, c) => {
    try {
        c.config = JSON.parse(pre.innerHTML
            ?.replaceAll("<br>", " ")
            .replaceAll("&nbsp;", " ") ?? "");
        delete pre.dataset.error;
    }
    catch (e) {
        console.log(e);
        pre.dataset.error = "true";
    }
};
export const updatePreview = (pre, c) => {
    if (pre instanceof HTMLPreElement) {
        pre.innerHTML = list(c)
            .replaceAll("\n", "<br>")
            .replaceAll(" ", "&nbsp;");
    }
};
export const renderWritings = (ws) => {
    let str = '';
    ws.forEach(w => {
        str += '<details>';
        str += '<summary>';
        str += w.created_at.slice(0, 10);
        str += ' - ';
        str += w.attributes.title;
        str += '</summary>';
        str += '<ul>';
        str += '<li>Author: @';
        str += w.author.nickname;
        str += '</li>';
        str += '<li>Category: ';
        str += w.attributes.category;
        str += '</li>';
        str += '<li>Tags: ';
        str += w.attributes.tags.map(t => t.slug).join(', ');
        str += '</li>';
        str += '</ul>';
        str += '</details>';
    });
    str += '';
    return str;
};
//# sourceMappingURL=lib.js.map