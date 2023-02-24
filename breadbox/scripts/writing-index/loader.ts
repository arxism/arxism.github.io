javascript: (async () => {
  const loadJS = async (url: string) =>
    new Promise((resolve) => {
      const el = document.createElement("script");
      el.addEventListener("load", resolve);
      el.setAttribute("async", "true");
      el.setAttribute("src", url);
      el.setAttribute("type", "module");
      document.head.appendChild(el);
    });

  const load = async (file: string) => {
    const nc = Date.now();
    return loadJS(`${file}?_v=${nc}`);
  };

  load('https://arxism.github.io/breadbox/scripts/writing-index/index.js')
})()
