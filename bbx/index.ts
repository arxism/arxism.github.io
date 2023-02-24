const scripts = ['writing-index'];

const loadScript = async (name: string) => {
  const anchor = document.createElement('a');
  anchor.setAttribute("id", name);
  anchor.innerHTML = name.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

  const copy = document.createElement('a');
  copy.setAttribute("id", `${name}-copy`);
  copy.innerHTML = "📋 Copy";

  const listSm = document.getElementById('bookmarklet-list-sm');
  listSm.innerHTML += `<li>${anchor.outerHTML} - ${copy.outerHTML}</li>`;

  const [js, load] = await Promise.all([
    (await fetch(`./src/${name}/loader.js`)).text(),
    (await fetch(`./utils/load.js`)).text(),
  ]);

  const links = document.querySelectorAll(`#${name}`) as NodeListOf<HTMLAnchorElement>;
  const copyLinks = document.querySelectorAll(`#${name}-copy`) as NodeListOf<HTMLAnchorElement>;
  let loadSrc = load.replaceAll('export ', '').replaceAll(/\/\/#.*/g, '');
  loadSrc = js.replace('let load = (_s) => { };', loadSrc);
  loadSrc = loadSrc.replaceAll('@@HOST@@', `${window.location.protocol}\/\/${window.location.host}`);
  Array.from(links).forEach(link => {
    link.href = loadSrc;
  })
  Array.from(copyLinks).forEach(link => {
    link.addEventListener('click', (e: MouseEvent) => {
      navigator.clipboard.writeText(loadSrc);
      (e.target as HTMLAnchorElement).innerHTML = "✔️ Copied!";
      setTimeout(() => (e.target as HTMLAnchorElement).innerHTML = "📋 Copy", 3000);
    });
  })
}

scripts.forEach(loadScript);
