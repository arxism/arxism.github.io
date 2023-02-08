javascript: (function() {
  var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  const _generatePoll = () => __awaiter(this, void 0, void 0, function*() {
    var _a, _b;
    const getMaxLength = (options) => {
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
    };
    const NUMBERS = /\d+/g;
    const getCommentData = (comment) => {
      var _a, _b, _c;
      const content = (new DOMParser()).parseFromString(comment.body, "text/html");
      const firstElement = (_a = content.body.children) === null || _a === void 0 ? void 0 : _a[0];
      const firstLine = `${firstElement.start}. ${firstElement.innerText}`;
      const votes = (_c = (_b = firstLine.match(NUMBERS)) === null || _b === void 0 ? void 0 : _b.map(vote => Number.parseInt(vote))) !== null && _c !== void 0 ? _c : [];
      return Object.assign(Object.assign({}, comment), { votes: [...(new Set(votes))] });
    };
    const getOptionData = (options, comments) => options
      .map((label, index) => ({
        ordinal: index + 1,
        label,
        count: 0,
        voters: comments.reduce((votes, comment) => {
          var _a;
          if (((_a = comment.votes) !== null && _a !== void 0 ? _a : []).includes(index + 1)) {
            return [...votes, `[${comment.author.nickname}](https://fetlife.com${comment.meta.path})`];
          }
          return votes;
        }, [])
      }));
    const renderSummary = (options, comments) => {
      var _a;
      const l = getMaxLength(options);
      const votes = options.reduce((count, option) => count + option.voters.length, 0);
      const voters = [...new Set(options.reduce((voters, option) => [...voters, ...option.voters], []))];
      const title = `─ ${votes} votes from ${voters.length} users ─`;
      const last = (_a = comments === null || comments === void 0 ? void 0 : comments.slice(-1)) === null || _a === void 0 ? void 0 : _a[0];
      const lastCounted = `─ last seen https://fetlife.com${last.author.nickname}`;
      return [
        `${title.padEnd(l.all / 2, '-')}`,
        `${lastCounted.padStart(l.all / 2, '-')}`
      ]
        .join('')
        .replace(last.author.nickname, `[${last.author.nickname}](${last.meta.path})`);
    };
    const renderData = (options) => {
      const divmod = (t, b) => [t / b, t % b];
      const maxLen = getMaxLength(options);
      const maxValue = Math.max(...options.map(o => o.count));
      const increment = maxValue / maxLen.bar;
      const str = options.reduce((str, { count, label, ordinal }) => {
        var _a;
        const [barChunks, remainder] = divmod(Number(count * 8 / increment), 8);
        let bar = ''.padStart(barChunks, '█');
        bar += remainder < 1 ? '' : String.fromCharCode('█'.charCodeAt(0) + (8 - remainder));
        const s = {
          ordinal: `* ${ordinal}\\. `.padEnd(maxLen.ordinal, ' '),
          count: String(count).padStart(maxLen.count, '0'),
          label: label.substring(0, maxLen.label).padStart(maxLen.label),
        };
        return [str, s.ordinal, `**${label}**`, '\n', (_a = s.count) !== null && _a !== void 0 ? _a : 0, bar, '\n'].join(' ');
      }, '');
      return str;
    };
    const renderNames = (options) => {
      return options.reduce((names, { voters, label, ordinal }) => {
        return [names, `* ${ordinal}`, `**${label}**:`, '\n', voters.join(', '), '\n'].join(' ');
      }, '');
    };
    const log = (msg) => alert(`FL POLL: ${msg}`);
    const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)\/posts\/(\d+)\/?/;
    const [_userId, postId] = (_b = (_a = URL_REG.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : [];
    if (!postId)
      return log('Not a writing');
    const pollList = document.querySelector('main .story__copy ol');
    if (!pollList)
      return log('Not a poll');
    const pollOptions = Array.from(pollList.querySelectorAll('li')).map(a => a.innerHTML);
    if (!pollOptions.length)
      return log('No options');
    const commentsResp = yield fetch(`https://fetlife.com/comments?content_type=Post&content_id=${postId}&since=0&all=true&vue=true`);
    const comments = (yield commentsResp.json()).entries.map(getCommentData);
    const voteComments = comments.filter(c => !c.parent_id);
    const options = getOptionData(pollOptions, voteComments)
      .map(option => (Object.assign(Object.assign({}, option), { count: option.voters.length })))
      .sort((a, b) => b.count - a.count);
    const summary = renderSummary(options, comments);
    const names = renderNames(options);
    const data = renderData(options);
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
  });
  _generatePoll();
})();
