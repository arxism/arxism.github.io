javascript: (async () => {
    const loadJS = async (url) => new Promise((resolve) => {
        const el = document.createElement("script");
        el.addEventListener("load", resolve);
        el.setAttribute("async", "true");
        el.setAttribute("src", url);
        el.setAttribute("type", "module");
        document.head.appendChild(el);
    });
    const load = async (file) => {
        const noCache = Date.now();
        return loadJS(`${file}?_v=${noCache}`);
    };
    load('http://localhost:8080/breadbox/scripts/writing-index/index.js');
})();
//# sourceMappingURL=loader.js.map