javascript: (async () => {
  let load = (_s: string) => {};
  await Promise.all([
    load("@@HOST@@/bbx/src/writing-index/index.js"),
    load("@@HOST@@/bbx/components/dialog/index.css"),
  ]);
})()
