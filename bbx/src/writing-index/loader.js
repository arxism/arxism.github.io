javascript: (async () => {
    let load = (_s) => { };
    await Promise.all([
        load("http://localhost:8080/bbx/src/writing-index/index.js"),
        load("http://localhost:8080/bbx/components/dialog/index.css"),
    ]);
})();
//# sourceMappingURL=loader.js.map