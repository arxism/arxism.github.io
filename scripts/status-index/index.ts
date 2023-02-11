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

	let config = JSON.parse(configString) as Config;
	let statuses = [] as Status[];


	const format = (s: Status) => {
		const e = config.escapeOutput ? '\\' : '';
		const { attributes: { created_at: createdAt, path, raw_body: rawBody, likes, comment_count: commentCount } } = s;
		const { counts: { like, love, adore, fire } } = config;

		const popularity = (() => {
			let liked = '';
			let chatty = '';
			if (likes.total >= like) liked = '♥️';
			if (likes.total >= love) liked = '❤️';
			if (likes.total >= adore) liked = '💝';
			if (likes.total >= fire) liked = '🔥';
			if (commentCount >= like) chatty = '💭';
			if (commentCount >= love) chatty = '💬';
			if (commentCount >= adore) chatty = '🗯️';
			if (commentCount >= fire) chatty = '🤯';
			return [liked, chatty].join(' ');
		})();

		return `${e}> ${rawBody.replaceAll('\n', `\n${e}> `)}\n${e}> ${e}[${createdAt.substring(0, 10)}](https://fetlife.com${path}) ${popularity} \n`;
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

	const date = () => {
		const e = config.escapeOutput ? '\\' : '';
		const dateString = (new Date()).toISOString().substring(0, 10);
		return `${e}### Last updated ${dateString}\n`;
	}

	const list = () => {
		const sorted = statuses
			.filter(st => !st.attributes.only_friends)
			.filter(st => {
			  if (config.showAll) return st;
				return st.attributes.likes.total > config.counts.like || st.attributes.comment_count > config.counts.like
			})
			.sort((a, b) => b.attributes.likes.total - a.attributes.likes.total);
		const before = [config.showLegend ? legend() : '', config.showDate ? date() : ''].filter(a => a);
		const strings = sorted.map(format)
		return [...before, ...strings].join('\n');
	}
	const log = (msg: string) => alert(`FL STATUS INDEX: ${msg}`);
	const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/
	const perPage = 7;
	const getStatuses = async (userId: string, marker?: string, i?: number): Promise<Status[]> => {
		const resp = await fetch(`https://fetlife.com/users/${userId}/activity/statuses?per_page=${perPage}${marker ? `&marker=${marker}` : ''}`, {
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
		const json = await resp.json();
		const { stories, no_more: noMore, marker: nextMarker } = json;

		const dialog = document.getElementById(eids.dialog) as HTMLDialogElement;
		document.querySelector(`#${eids.status}`)!.innerHTML = `getting statuses... ${perPage * (i ?? 0)}`;
		await new Promise(resolve => setTimeout(resolve, 1500));
		console.log(stories);
		return (noMore || !nextMarker || !dialog?.open) ? stories : [...stories, ...(await getStatuses(userId, nextMarker, (i ?? 0) + 1))];
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

		statuses = await getStatuses(userId);
		updatePreview();
		document.getElementById(eids.status)!.innerHTML = `${statuses.length} statuses found`;
		document.getElementById(eids.copy)!.addEventListener('click', () => onCopy());
	};

	main();
};

_generateIndex();

// Types

interface Config {
	showLegend: boolean;
	showDate: boolean;
	showAll: boolean;
	escapeOutput: boolean;
	counts: {
		like: number;
		love: number;
		adore: number;
		fire: number;
	}
}

interface Status {
	"type": string,
	"feed_event_id": number,
	"timestamp": number,
	"created_at": string,
	"target_path": string,
	"actor_id": number,
	"author": {
		"id": number,
		"nickname": string,
		"small_avatar_url": string,
		"show_badge": boolean
	},
	"html": null,
	"attributes": {
		"author": {
			"id": number,
			"nickname": string
		},
		"id": number,
		"body": string,
		"raw_body": string,
		"edited": boolean,
		"created_at": string,
		"comment_count": number,
		"path": string,
		"likes": {
			"total": number,
			"is_liked_by_user": boolean,
			"user_can_like": boolean
		},
		"only_friends": boolean,
		"privacy_locked": boolean,
		"closed": boolean
	},
	"originator": string,
	"is_grouped": boolean,
	"is_deletable": boolean
}

