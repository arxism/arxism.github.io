const scripts = ['writing-index'];

const loadScript = (name) => {
  const anchor = document.createElement('a');
  anchor.setAttribute("id", name);
  anchor.innerHTML = name.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  const listSm = document.getElementById('bookmarklet-list-sm');
  listSm.appendChild(anchor);

  const js = new XMLHttpRequest();
  js.open('GET', `./scripts/${name}/loader.js`);
  js.onreadystatechange = function() {
    debugger;
    const links = document.querySelectorAll(`#${name}`);
    Array.from(links).forEach(link => {
      link.href = js.responseText;
    })
  }
  js.send();
}

scripts.forEach(loadScript);
