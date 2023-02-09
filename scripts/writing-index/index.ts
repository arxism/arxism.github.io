const _generateIndex = async () => {
	const categories: [Category, string[]][] = [
		['Index', ['index']],
		['Erotica', ['erotica']],
		['Photography', ['photography']],
		['Satire / Parody', ['satire', 'parody']],
		['Poetry', ['poetry', 'poem']],
		['Dominance / submission', ['d-s', 'dominant', 'dominance', 'submission', 'dom', 'dominate', 'domination']],
		['Polls', ['poll']],
		['FetLife', ['fetlife']],
		['General', ['writing', 'self-reflection']],
	];
	const order: Category[] = ['Polls', 'General', 'FetLife', 'Dominance / submission', 'Poetry', 'Satire / Parody', 'Erotica', 'Photography', 'Misc'];
	const challenges = ['WBDC', '#'];
	const tier = {
		like: 25,
		love: 50,
		adore: 100,
		fire: 250,
	}
	const simple = false;

	const eids = {
		close: '_index-dialog-close',
		dialog: '_index-dialog',
		copy: '_index-dialog-copy',
	}

	const getChallengeLinks = (html: string) => {
		const document = (new DOMParser()).parseFromString(html, "text/html");
		const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a'));
		return links.map(
			l => challenges.some(p => l.innerHTML.trim().startsWith(p)) ? `*[${l.innerHTML}](${l.href})*` : ''
		).filter(a => a);
	}

	const format = (writings: { [category: string]: string[] }, writing: Writing): { [category: string]: string[] } => {
		const { attributes: { created_at: createdAt, comment_count: commentCount, title, path, tags, body, likes } } = writing;

		const links = getChallengeLinks(body);
		const tagNames = tags.map(t => t.slug);
		const category: Category = categories.reduce((cat, [title, slugs]) => {
			if (cat !== 'Misc') return cat;
			return tagNames.some(t => slugs.includes(t)) ? title : cat;
		}, 'Misc' as Category);
		const popularity = (() => {
			let liked = '➖';
			let chatty = '➖';
			if (likes.total >= tier.like) liked = '♥️';
			if (likes.total >= tier.love) liked = '❤️';
			if (likes.total >= tier.adore) liked = '💝';
			if (likes.total >= tier.fire) liked = '🔥';
			if (commentCount >= tier.like) chatty = '💭';
			if (commentCount >= tier.love) chatty = '💬';
			if (commentCount >= tier.adore) chatty = '🗯️';
			if (commentCount >= tier.fire) chatty = '🤯';
			return simple ? '➖' : `${liked}${chatty} `;
		})();

		return {
			...writings,
			[category]: [
				...(writings[category] ?? []),
				`* ${createdAt.substring(0, 10)} ${popularity} [${title}](https://fetlife.com${path}) ${links.join(' ')}`,
			]
		};
	}

	const list = (writings: Writing[]) => {
		const processed = writings.reduce(format, {});
		const strings = order
			.filter(category => processed?.[category]?.length)
			.map(category => `### ${category}\n\n${(processed[category] ?? []).join('\n')}\n`);
		return strings.join('\n');
	}

	const log = (msg: string) => alert(`FL WRITING INDEX: ${msg}`);

	const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/

	const [userId] = URL_REG.exec(window.location.href)?.slice(1) ?? [];
	if (!userId) return log('Not on user page');

	interface RenderProps {
		buttonText?: string;
		buttonFn?: (e?: Event) => void,
		text?: string;
	}
	const renderDialog = ({ buttonText, buttonFn = () => { }, text }: RenderProps, open: boolean): HTMLDialogElement => {
		const dialog = document.createElement('dialog');
		dialog.setAttribute('id', eids.dialog)
		dialog.setAttribute('style', "position: relative;background: #222;color: #fff;border: none;display: flex;flex-direction: column;padding: 20px;");
		const buttonStyle = "border: none;background: #c00;color: #fff;padding: 10px;margin-top: 12px;"
		let innerHTML = `${text}`
		if (buttonText) {
			innerHTML += `<button style="${buttonStyle}" id="${eids.copy}">${buttonText}</button>`;
		}
		innerHTML += `<button id="${eids.close}" style="${buttonStyle}">Close</button>`;
		dialog.innerHTML = innerHTML;

		const old = document.getElementById(eids.dialog);
		if (old) {
			document.body.replaceChild(dialog, old);
		} else {
			document.body.appendChild(dialog);
		}

		document.getElementById(eids.copy)?.addEventListener('click', buttonFn);
		document.getElementById(eids.close)?.addEventListener('click', () => dialog.close());
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}

		return dialog;
	}

	const perPage = 7;
	const getWritings = async (marker?: string, i?: number): Promise<Writing[]> => {
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

		const dialog = renderDialog({ text: `getting writings... ${perPage * (i ?? 0)}` }, true);
		await new Promise(resolve => setTimeout(resolve, 1500));
		return (noMore || !nextMarker || !dialog.open) ? stories : [...stories, ...(await getWritings(nextMarker, (i ?? 0) + 1))];
	};

	const writings = await getWritings();
	const onCopy = () => {
		navigator.clipboard.writeText(list(writings))
		renderDialog({ text: `${writings.length} writings found`, buttonText: `Copied ✓` }, true)
	};
	renderDialog({ text: `${writings.length} writings found`, buttonText: `Copy Index`, buttonFn: onCopy }, true)
};

_generateIndex();

// Types

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
