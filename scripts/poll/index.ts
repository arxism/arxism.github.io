javascript: (function() {
  const _generatePoll = async () => {
    const getMaxLength = (options: Option[]) => {
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
    }

    const NUMBERS = /\d+/g;
    const getCommentData = (comment: Comment): Comment => {
      const content = (new DOMParser()).parseFromString(comment.body, "text/html");
      const firstElement = content.body.children?.[0] as HTMLOListElement;

      const firstLine = `${firstElement.start}. ${firstElement.innerText}`;
      const votes = firstLine.match(NUMBERS)?.map(vote => Number.parseInt(vote)) ?? [];

      return {
        ...comment,
        votes: [...(new Set(votes))],
      }
    }

    const getOptionData = (options: string[], comments: Comment[]): Option[] => options
      .map((label, index) => ({
        ordinal: index + 1,
        label,
        count: 0,
        voters: comments.reduce((votes, comment) => {
          if ((comment.votes ?? []).includes(index + 1)) {
            return [...votes, `[${comment.author.nickname}](https://fetlife.com${comment.meta.path})`];
          }
          return votes;
        }, [] as string[])
      }));

    const renderSummary = (options: Option[], comments: Comment[]): string => {
      const l = getMaxLength(options);
      const votes = options.reduce((count, option) => count + option.voters.length, 0);
      const voters = [...new Set(
        options.reduce((voters, option) => [...voters, ...option.voters], [] as string[])
      )];
      const title = `─ ${votes} votes from ${voters.length} users ─`;
      const last = comments?.slice(-1)?.[0];
      const lastCounted = `─ last seen ${last.author.nickname}`;
      return [
        `${title.padEnd(l.all / 2, '-')}`,
        `${lastCounted.padStart(l.all / 2, '-')}`
      ]
        .join('')
        .replace(last.author.nickname, `[${last.author.nickname}](https://fetlife.com${last.meta.path})`);
    }

    const renderData = (options: Option[]) => {
      const divmod = (t: number, b: number) => [t / b, t % b];
      const maxLen = getMaxLength(options);
      const maxValue = Math.max(...options.map(o => o.count));
      const increment = maxValue / maxLen.bar;

      const str = options.reduce((str, { count, label, ordinal }) => {
        const [barChunks, remainder] = divmod(Number(count * 8 / increment), 8);
        let bar = ''.padStart(barChunks, '█');
        bar += remainder < 1 ? '' : String.fromCharCode('█'.charCodeAt(0) + (8 - remainder));
        const s = {
          ordinal: `* ${ordinal}\\. `.padEnd(maxLen.ordinal, ' '),
          count: String(count).padStart(maxLen.count, '0'),
          label: label.substring(0, maxLen.label).padStart(maxLen.label),
        };
        return [str, s.ordinal, `**${label}**`, '\n', s.count ?? 0, bar, '\n'].join(' ');
      }, '')

      return str;
    }

    const renderNames = (options: Option[]) => {
      return options.reduce((names, { voters, label, ordinal }) => {
        return [names, `* ${ordinal}`, `**${label}**:`, '\n', voters.join(', '), '\n'].join(' ');
      }, '')
    }

    const log = (msg: string) => alert(`FL POLL: ${msg}`);

    const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)\/posts\/(\d+)\/?/

    const [_userId, postId] = URL_REG.exec(window.location.href)?.slice(1) ?? [];
    if (!postId) return log('Not a writing');

    const pollList = document.querySelector('main .story__copy ol');
    if (!pollList) return log('Not a poll');

    const pollOptions = Array.from(pollList.querySelectorAll('li')).map(a => a.innerHTML);
    if (!pollOptions.length) return log('No options');

    const commentsResp = await fetch(`https://fetlife.com/comments?content_type=Post&content_id=${postId}&since=0&all=true&vue=true`);
    const comments: Comment[] = (await commentsResp.json()).entries.map(getCommentData);
    const voteComments = comments.filter(c => !c.parent_id);

    const options = getOptionData(pollOptions, voteComments)
      .map(option => ({ ...option, count: option.voters.length }))
      .sort((a, b) => b.count - a.count);

    const summary = renderSummary(options, comments);
    const names = renderNames(options);
    const data = renderData(options)

    let str = '';

    str += `---`;
    str += `\n## Results`;
    str += `\n\n${data}`;
    str += `\n\n${summary}`;
    str += `\n\n${names}`;
    str += `\n---`;
    str += `\n### To vote`;
    str += `\n`;
    str += `\n### Voting requires a number. The first line of your reply will be read for your numeric choice(s). Replies will only be tallied if they contain numeric values and only top-level replies are read.`;

    navigator.clipboard.writeText(str);
    log(summary);
  };

  _generatePoll();

  // Types

  interface Comment {
    "votes"?: number[];
    "id": number;
    "klass": string;
    "body": string;
    "love_count": number;
    "parent_id": number;
    "is_edited": boolean;
    "created_at": string;
    "author": {
      "avatar_url": string;
      "profile_url": string;
      "asr": string;
      "supporter_badge": boolean;
      "nickname": string;
      "id": number;
    }
    "meta": {
      "path": string;
      "reply_enabled": boolean;
      "love_enabled": boolean;
      "can_love": boolean;
      "is_loved": boolean;
      "block_enabled": boolean;
      "unblock_enabled": boolean;
      "report_enabled": boolean;
      "edit_enabled": boolean;
      "raw_body": string;
      "delete_enabled": boolean;
      "undelete_enabled": boolean;
      "easy_controls": boolean;
      "ban_enabled": boolean;
      "unban_enabled": boolean;
      "is_author_leader": boolean;
      "is_author_original_poster": boolean
    }
  }

  interface Option {
    ordinal: number;
    label: string;
    voters: string[];
    count: number;
  }

  interface MaxLength {
    ordinal: number;
    label: number;
    short: number;
    count: number;
    bar: number;
    all: number;
  }
})()
