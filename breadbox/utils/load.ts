export const loadJS = async (url: string) =>
  new Promise((resolve) => {
    const el = document.createElement("script");
    el.addEventListener("load", resolve);
    el.setAttribute("async", "true");
    el.setAttribute("src", url);
    el.setAttribute("type", "module");
    document.head.appendChild(el);
  });

export const loadCSS = async (url: string) =>
  new Promise((resolve) => {
    const el = document.createElement("link");
    el.addEventListener("load", resolve);
    el.setAttribute("rel", "stylesheet");
    el.setAttribute("href", url);
    document.head.appendChild(el);
  });

export const loadHTML = async (url: string) => {
  const response = await fetch(url);
  const text = await response.text();
  document.body.innerHTML += text;
  return Promise.resolve();
};

const loader = {
  js: loadJS,
  css: loadCSS,
  html: loadHTML,
} as const;

export const load = async (file: string) => {
  const noCache = Date.now();
  const ext = file.split(/[#?]/)[0].split('.').pop()?.trim() ?? '';
  if (loader.hasOwnProperty(ext)) {
    const key = ext as keyof typeof loader;
    return loader[key](`${file}?_v=${noCache}`);
  }
};

