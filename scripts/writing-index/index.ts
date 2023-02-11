const _generateIndex = async () => {
	const slug = '_index-dialog' as const;
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
	} as const;

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
  	padding: 20px;
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
  "showLegend": true,\n
  "showCategories": false,\n
  "showCounts": true,\n
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
  "categoryOrder": ["Polls", "General", "FetLife", "Dominance / submission", "Poetry", "Satire / Parody", "Erotica", "Photography", "Misc"],\n
  "hashtags": ["WBDC", "#"],\n
  "counts": {\n
    "like": 25,\n
    "love": 50,\n
    "adore": 100,\n
    "fire": 250\n
   },\n
  "escapeOutput": false\n
}\n`;

	let config = JSON.parse(configString) as Config;
	let writings = [] as Writing[];

	const getChallengeLinks = (html: string) => {
		const { hashtags } = config;
		const document = (new DOMParser()).parseFromString(html, "text/html");
		const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a'));
		const e = config.escapeOutput ? '\\' : '';
		return links.map(
			l => hashtags.some(p => l.innerHTML.trim().startsWith(p)) ? `${e}*${e}[${l.innerHTML}](${l.href})${e}*` : ''
		).filter(a => a);
	}

	const format = (writings: { [category: string]: string[] }, writing: Writing): { [category: string]: string[] } => {
		const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;
		const { escapeOutput, showCategories, categories, showCounts, counts: { like, love, adore, fire } } = config;

		const links = getChallengeLinks(body);
		const tagNames = tags.map(t => t.slug);
		const category: Category = categories.reduce((cat, [title, slugs]) => {
			if (!showCategories) return 'Misc';
			if (cat !== 'Misc') return cat;
			return tagNames.some(t => slugs.includes(t)) ? title : cat;
		}, 'Misc' as Category);
		const popularity = (() => {
			let liked = '➖';
			let chatty = '➖';
			if (likes.total >= like) liked = '♥️';
			if (likes.total >= love) liked = '❤️';
			if (likes.total >= adore) liked = '💝';
			if (likes.total >= fire) liked = '🔥';
			if (commentCount >= like) chatty = '💭';
			if (commentCount >= love) chatty = '💬';
			if (commentCount >= adore) chatty = '🗯️';
			if (commentCount >= fire) chatty = '🤯';
			return showCounts ? `${liked}${chatty}` : '➖';
		})();
		const e = escapeOutput ? '\\' : '';

		return {
			...writings,
			[category]: [
				...(writings[category] ?? []),
				`${e}* ${createdAt.substring(0, 10)} ${popularity} ${e}[${title}](https://fetlife.com${path}) ${links.join(' ')}`,
			]
		};
	}

	const legend = () => {
		const { like, love, adore, fire } = config.counts;
		const e = config.escapeOutput ? '\\' : '';
		return `${e}#### Legend\n
\n
${e}* ♥️ 💭 > ${like} loves / comments\n
${e}* ❤️ 💬 > ${love} loves / comments\n
${e}* 💝 🗯️ > ${adore} loves / comments\n
${e}* 🔥 🤯 > ${fire} loves / comments\n`
	};

	const list = () => {
		const processed = writings.filter(w => !w.attributes.only_friends).reduce(format, {});
		const e = config.escapeOutput ? '\\' : '';
		const cats = config.categoryOrder
			.filter(category => processed?.[category]?.length)
			.map(category => `${e}### ${category}\n\n${(processed[category] ?? []).join('\n')}\n`);
		const strings = config.showLegend ? [legend(), ...cats] : cats;
		return strings.join('\n');
	}
	const log = (msg: string) => alert(`FL WRITING INDEX: ${msg}`);
	const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/
	const perPage = 7;
	const getWritings = async (userId: string, marker?: string, i?: number): Promise<Writing[]> => {
		const writingsResp = await fetch(`https://fetlife.com/users/${userId}/activity/writings?per_page=${perPage}${marker ? `&marker=${marker}` : ''}`, {
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
		const json = await writingsResp.json();
		const { stories, no_more: noMore, marker: nextMarker } = json;
		console.log(`waiting ${nextMarker}`);

		const dialog = document.getElementById(eids.dialog) as HTMLDialogElement;
		document.querySelector(`#${eids.status}`)!.innerHTML = `getting writings... ${perPage * (i ?? 0)}`;
		await new Promise(resolve => setTimeout(resolve, 1500));
		return (noMore || !nextMarker || !dialog?.open) ? stories : [...stories, ...(await getWritings(userId, nextMarker, (i ?? 0) + 1))];
	};

	const updateConfig = () => {
		let next = config;
		document.querySelector(`#${eids.copy}`)!.innerHTML = `Copy Index`;
		try {
			next = JSON.parse(document.getElementById(eids.config)?.innerHTML?.replaceAll('<br>', ' ').replaceAll('&nbsp;', ' ') ?? '') as Config;
			config = next;
			(document.querySelector(`#${eids.dialog}`)! as HTMLDialogElement).dataset.error = 'false';
		} catch (e) {
			(document.querySelector(`#${eids.dialog}`)! as HTMLDialogElement).dataset.error = 'true';
		}
	};

	const updatePreview = () => {
		document.getElementById(eids.preview)!.innerHTML = list().replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
	}

	const onCopy = () => {
		navigator.clipboard.writeText(list())
		document.querySelector(`#${eids.copy}`)!.innerHTML = `Copied ✓`;
	};

	const renderDialog = () => {
		document.body.innerHTML += dialogString;
		document.head.innerHTML += styles;
		const template = document.getElementById(eids.template) as HTMLTemplateElement;
		const dialog = template.content.cloneNode(true) as HTMLDialogElement;

		dialog.querySelector(`#${eids.config}`)!.innerHTML = configString.replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
		dialog.querySelector(`#${eids.config}`)!.addEventListener('blur', () => {
			updateConfig();
			updatePreview();
		});
		dialog.querySelector(`#${eids.copy}`)!.innerHTML = `Copy Index`;
		dialog.querySelector(`#${eids.close}`)?.addEventListener('click', () => {
			const d = document.getElementById(eids.dialog);
			if (d) document.body.removeChild(d);
		});

		document.body.appendChild(dialog);
		updatePreview();
	}


	const main = async () => {
		const [userId] = URL_REG.exec(window.location.href)?.slice(1) ?? [];
		if (!userId) return log('Not on user page');

		renderDialog();
		(document.getElementById(eids.dialog) as HTMLDialogElement).showModal();

		writings = await getWritings(userId);
		updatePreview();
		document.getElementById(eids.status)!.innerHTML = `${writings.length} writings found`;
		document.getElementById(eids.copy)!.addEventListener('click', () => onCopy());
	};

	main();
};

_generateIndex();

// Types

interface Config {
	showLegend: boolean;
	showCounts: boolean;
	showCategories: boolean;
	categories: [Category, string[]][];
	categoryOrder: Category[];
	hashtags: string[];
	escapeOutput: boolean;
	counts: {
		like: number;
		love: number;
		adore: number;
		fire: number;
	}
}

interface Writing {
	type: string,
	feed_event_id: number,
	timestamp: number,
	created_at: string,
	target_path: string,
	actor_id: number,
	author: {
		id: number,
		nickname: string,
		small_avatar_url: string,
		show_badge: boolean,
	}
	html: null,
	attributes: {
		author: {
			id: number,
			nickname: string,
		},
		id: number,
		body: string,
		category: string,
		title: string,
		edited: boolean,
		created_at: string,
		comment_count: number,
		path: string,
		likes: {
			total: number,
			is_liked_by_user: boolean,
			user_can_like: boolean,
		}
		only_friends: boolean,
		action_name: string,
		closed: boolean,
		tags: {
			id: number,
			name: string,
			slug: string,
			approved: boolean,
		}[]
	}
	originator: string,
	is_grouped: boolean,
	is_deletable: boolean,
}

type Category = string;
