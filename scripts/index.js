const scripts = ['update-poll', 'writing-index', 'status-index'];

const loadScript = (name) => {
  const clone = document.getElementById('bookmarklet-template').content.cloneNode(true);
  const root = clone.querySelector('.rect');
  root.querySelector('a').innerHTML = name.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  root.setAttribute('id', name);
  const list = document.getElementById('bookmarklet-list');
  const listSm = document.getElementById('bookmarklet-list-sm');
  const anchor = root.querySelector('a');
  anchor.setAttribute('id', name);
  listSm.appendChild(anchor.cloneNode(true));
  list.appendChild(clone);

  const wrap = code => `javascript: (function() {\n${code}\n})()`;
  const js = new XMLHttpRequest();
  js.open('GET', `./${name}/index.js`);
  js.onreadystatechange = function() {
    const links = document.querySelectorAll(`#${name}`);
    const pre = document.querySelector(`#${name} pre.code-js > code`);
    Array.from(links).forEach(link => {
      link.href = wrap(js.responseText);
    })
    pre.innerHTML = wrap(js.responseText);
    hljs.highlightAll();
  }
  js.send();


  const ts = new XMLHttpRequest();
  ts.open('GET', `./${name}/index.ts`);
  ts.onreadystatechange = function() {
    const pre = document.querySelector(`#${name} pre.code-ts > code`);
    pre.innerHTML = ts.responseText;
    hljs.highlightAll();
  }
  ts.send();


  const md = new XMLHttpRequest();
  md.open('GET', `./${name}/index.md`);
  md.onreadystatechange = function() {
    const pre = document.querySelector(`#${name} pre.code-md > code`);
    pre.innerHTML = md.responseText;
    hljs.highlightAll();
  }
  md.send();
}

scripts.forEach(loadScript);

addEventListener('hashchange', () => {
  document.body.dataset.language = window.location.hash.slice(1);
})

document.body.dataset.language = window.location.hash.slice(1) || 'md';
