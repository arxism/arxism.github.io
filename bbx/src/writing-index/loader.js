javascript: (async () => {
    let load = (_s) => { };
    await Promise.all([
        load("@@HOST@@/bbx/src/writing-index/index.js"),
        load("@@HOST@@/bbx/components/dialog/index.css"),
    ]);
})();
//# sourceMappingURL=loader.js.map