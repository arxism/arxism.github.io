const scripts = ['writing-index'];
const loadScript = async (name) => {
    const anchor = document.createElement('a');
    anchor.setAttribute("id", name);
    anchor.innerHTML = name.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    const listSm = document.getElementById('bookmarklet-list-sm');
    listSm?.appendChild(anchor);
    const [js, load] = await Promise.all([
        (await fetch(`./src/${name}/loader.js`)).text(),
        (await fetch(`./utils/load.js`)).text(),
    ]);
    const links = document.querySelectorAll(`#${name}`);
    const loadSrc = load.replaceAll('export ', '').replaceAll(/\/\/#.*/g, '');
    Array.from(links).forEach(link => {
        link.href = js.replace('let load = (_s) => { };', loadSrc);
    });
};
scripts.forEach(loadScript);
//# sourceMappingURL=index.js.map