const _generateIndex = async () => {
	const slug = '_index-writing-dialog' as const;
	const eids = _getEids(slug);
	const version = "v1.0.0";
	const title = `writing-index ${version}`;

	let config: Config = {
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

	let writings = [] as Writing[];

	const getChallengeLinks = (html: string) => {
		const { hashtags, escapeOutput } = config;
		const document = (new DOMParser()).parseFromString(html, "text/html");
		const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a'));
		const e = escapeOutput ? '\\' : '';
		return links.map(
			l => hashtags.some(p => l.innerHTML.trim().startsWith(p)) ? `${e}*${e}[${l.innerHTML}](${l.href})${e}*` : ''
		).filter(a => a);
	}

	const format = (writings: { [category: string]: string[] }, writing: Writing): { [category: string]: string[] } => {
		const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;
		const { escapeOutput, showCategories, category, showCounts, counts: { like, love, adore, fire } } = config;

		const links = getChallengeLinks(body);
		const tagNames = tags.map(t => t.slug);
		const cat: Category = Object.entries(category?.tags ?? []).reduce((cat, [id, ctags]) => {
			if (!showCategories) return 'misc';
			if (cat !== 'misc') return cat;
			return tagNames.some(t => ctags.includes(t)) ? id : cat;
		}, 'misc' as Category);
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
			[cat]: [
				...(writings[cat] ?? []),
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
		const cats = Object.entries(config.category.order)
			.filter(([id]) => processed?.[id]?.length)
			.map(([id, name]) => `${e}### ${name}\n\n${(processed[id] ?? []).join('\n')}\n`);
		const strings = config.showLegend ? [legend(), ...cats] : cats;
		return strings.join('\n');
	}
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
		return (noMore || !nextMarker || !dialog?.open || dialog.dataset.loading !== 'true') ? stories : [...stories, ...(await getWritings(userId, nextMarker, (i ?? 0) + 1))];
	};

	const updateConfig = () => {
		let next = config;
		document.querySelector(`#${eids.copy}`)!.innerHTML = `Copy Index`;
		try {
			next = JSON.parse(document.getElementById(eids.config)?.innerHTML?.replaceAll('<br>', ' ').replaceAll('&nbsp;', ' ') ?? '') as Config;
			config = next;
			(document.querySelector(`#${eids.dialog}`)! as HTMLDialogElement).dataset.error = '';
		} catch (e) {
			(document.querySelector(`#${eids.dialog}`)! as HTMLDialogElement).dataset.error = 'config';
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
		document.body.innerHTML += _dialogString(eids);
		document.head.innerHTML += _dialogStyles(eids);
		const template = document.getElementById(eids.template) as HTMLTemplateElement;
		const dialog = template.content.cloneNode(true) as HTMLDialogElement;

		dialog.querySelector(`#${eids.title}`)!.innerHTML = title;
		dialog.querySelector(`#${eids.config}`)!.innerHTML = JSON.stringify(config, null, 2).replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;');
		dialog.querySelector(`#${eids.config}`)!.addEventListener('blur', () => {
			updateConfig();
			updatePreview();
		});
		dialog.querySelector(`#${eids.copy}`)!.innerHTML = `Copy Index`;
		dialog.querySelector(`#${eids.close}`)?.addEventListener('click', () => {
			const d = document.getElementById(eids.dialog);
			if (d) document.body.removeChild(d);
		});
		dialog.querySelector(`#${eids.stop}`)?.addEventListener('click', () => {
			const d = document.getElementById(eids.dialog) as HTMLDialogElement;
			d.dataset.loading = "";
		});

		document.body.appendChild(dialog);
		updatePreview();
	}


	const main = async () => {
		renderDialog();
		const [userId] = URL_REG.exec(window.location.href)?.slice(1) ?? [];
		if (!userId) {
			(document.querySelector(`#${eids.dialog}`)! as HTMLDialogElement).dataset.error = 'true';
			(document.querySelector(`#${eids.copy}`) as HTMLButtonElement).disabled = true;
			(document.querySelector(`#${eids.error}`) as HTMLButtonElement).innerHTML = 'Not on a user page';
		}

		const dialog = document.getElementById(eids.dialog) as HTMLDialogElement;
		dialog.showModal();

		dialog.dataset.loading = 'true';
		writings = dialog.dataset.error ? [] : await getWritings(userId);
		updatePreview();
		dialog.dataset.loading = '';
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
	category: {
		tags: { [category: string]: string[] };
		order: { [category: string]: string };
	}
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
