const scripts = ['poll'];

const loadScript = (name) => {
  console.log(name);
  const js = new XMLHttpRequest();
  js.open('GET', `./${name}/index.js`);
  js.onreadystatechange = function() {
    const link = document.querySelector(`#${name} .bookmark a`);
    const pre = document.querySelector(`#${name} pre.code-js > code`);
    link.href = js.responseText;
    pre.innerHTML = js.responseText;
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
}

scripts.forEach(loadScript);

addEventListener('hashchange', () => {
  document.body.dataset.language = window.location.hash.slice(1);
})
