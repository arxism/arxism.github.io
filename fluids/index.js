const fetishes = {
  "Being Dominant": "Being Dominant",
  "Being submissive": "Being \\submissive",
  "Being a Master": "Being \\a Master",
  "Being a slave": "Being \\a \\slave",
  "Being a Brat": "Being \\a Brat",
  "Sadism": "Sadism",
  "Masochism": "Masochism",
  "Bondage/Restraints": "Bondage/ Restraints",
  "Age play": "Age play",
  "Anal": "Anal",
  "Biting": "Biting",
  "Blood Play": "Blood Play",
  "Body Modification": "Body Modification",
  "Breath Play": "Breath Play",
  "Casual Intimacy": "Casual Intimacy",
  "Cock Worship": "Cock Worship",
  "Collars & Leads": "Collars & Leads",
  "Consensual NonConsent": "Consensual NonConsent",
  "Cuddling": "Cuddling",
  "Daddy/girl": "Daddy/girl",
  "Deep Thoughtful Discussion": "Deep Thoughtful Discussion",
  "Electrical Play": "Electrical Play",
  "Exhibitionism": "Exhibit -ionism",
  "Eye Contact": "Eye Contact",
  "Feet": "Feet",
  "Findom": "Findom",
  "Fire play": "Fire play",
  "Free Use": "Free Use",
  "Furry": "Furry",
  "Gags & Blindfolds": "Gags & Blindfolds",
  "High Protocol": "High Protocol",
  "Humiliation & Degradation": "Humiliation & Degradation",
  "Impact": "Impact",
  "Intelligence": "Intelligence",
  "Kissing/Making Out": "Kissing/ Making Out",
  "Knife Play": "Knife Play",
  "Leather, Latex": "Leather, Latex",
  "Lingerie": "Lingerie",
  "Multiple Partners": "Multiple Partners",
  "Needles": "Needles",
  "Pet Play": "Pet Play",
  "Role play": "Role play",
  "Rope Play": "Rope Play",
  "Rules & Assignments": "Rules & Assignments",
  "Sex in Public": "Sex \\in Public",
  "Tearing Clothes": "Tearing Clothes",
  "Watersports": "Watersports",
  "Wax Play": "Wax Play",
  "Wrestling": "Wrestling"
};

const MAX = 1000;
const getSearch = () => new URLSearchParams(window.location.hash.substring(1));
const getConfig = () => {

  const search = getSearch();
  const config = {
    unit: search.get('unit') ?? 'volume',
    sort: search.get('sort') ?? 'custom',
    title: search.get('title') ?? 'Fetish Fluids Report',
    link: search.get('link') ?? '',
    author: search.get('author') ?? '@SomoneOnFet',
    color: search.get('color') ?? '#8833aa',
    theme: search.get('theme') ?? 'dark',
    tileWidth: search.get('tileSize') ?? 160,
    textSize: search.get('textSize') ?? 48,
    kinks: search.getAll('kink')?.reduce((kinks, kink) => {
      const [k, v] = kink.split(':');
      return { ...kinks, [k]: v }
    },
      {}
    ),
    note: search.get('note') ?? '> Always wear protection when working with fetish fluids.',
  }

  return config;
}
const fill = (amount) => `m 43.7 ${413 - amount} l 0 ${amount} a 136.1 44.3 0 0 0 1.5 5.1 a 136.1 44.3 0 0 0 136.1 44.3 a 136.1 44.3 0 0 0 136.2 -44.3 l 0.5 -5.1 l 0 -${amount} l -0.7 0 a 136.2 40.6 0 0 1 -136 39.4 a 136.2 40.6 0 0 1 -135.9 -39.4 l -1.7 0 z`;

const drawBeaker = (c, name, ml) => {
  const search = getSearch();
  const beaker = document.getElementById('beaker');

  const clone = beaker.content.cloneNode(true);
  const tile = clone.querySelector('.tile');
  const fillElement = clone.querySelector('#fill');
  const topElement = clone.querySelector('#fill-top');
  tile.dataset.kink = name;
  if (search.get('selected') === name) {
    tile.dataset.selected = true;
  }

  const volume = ml * 360 / MAX;
  if (ml > 0) {
    fillElement.setAttribute('d', fill(volume));
    tile.dataset.hot = false;
    if (ml <= 100) tile.dataset.hot = 'cold';
    if (ml > 500) tile.dataset.hot = 'warm';
    if (ml > 750) tile.dataset.hot = true;
    if (ml > 900) tile.dataset.hot = 'very';
    topElement.setAttribute('cy', 417.8 - volume);
  }
  const split = name.split(' ');

  const textElements = clone.querySelectorAll('text');
  Array.from(textElements).map((t, i) => {
    t.setAttribute('y', 373 - volume + (i * c.textSize));
    t.setAttribute('x', 340);
    if (i === 0) {
      if (c.unit === 'volume') {
        t.innerHTML = `${ml.toFixed(2)} ml`;
      } else {
        t.innerHTML = `${(ml / MAX * 100).toFixed(2)}%`;
      }
    } else {
      const word = split?.[i - 1];
      if (['\\', '-'].some(c => word?.startsWith(c))) t.dataset.customCase = true;
      t.innerHTML = word?.replace('\\', '') ?? '';
    }
  })
  return clone;
}

const swapKinks = (a, b) => {
  const search = getSearch();
  const kinks = search.getAll('kink')
  const aIndex = kinks.findIndex(k => k.split(':')[0] === a);
  const bIndex = kinks.findIndex(k => k.split(':')[0] === b);
  const hold = kinks[aIndex];
  kinks[aIndex] = kinks[bIndex];
  kinks[bIndex] = hold;
  search.delete('kink');
  kinks.forEach(k => search.append('kink', k));
  window.location.hash = `#${search.toString()}`;
}

const sortKinks = (o) => {
  const search = getSearch();
  const order = o ?? search.get('sort') ?? 'custom';
  const kinks = search.getAll('kink')
  if (order === 'asc') {
    kinks.sort((a, b) => a.split(':')[1] - b.split(':')[1]);
  }
  if (order === 'desc') {
    kinks.sort((a, b) => b.split(':')[1] - a.split(':')[1]);
  }
  if (order === 'alpha') {
    kinks.sort((a, b) => a.split(':')[0].toLowerCase() > b.split(':')[0].toLowerCase());
  }
  search.delete('kink');
  kinks.forEach(k => search.append('kink', k));
  window.location.hash = `#${search.toString()}`;
}

const deleteKink = (kink) => {
  const search = getSearch();
  let kinks = search.getAll('kink').reduce((left, kStr) => {
    const [n, s] = kStr.split(':');
    if (n === kink) {
      return left;
    }
    return [...left, kStr];
  }, []);
  search.delete('kink');
  kinks.forEach(kink => search.append('kink', kink));
  window.location.hash = `#${search.toString()}`;
}

const updateHash = (k, v) => {
  const search = getSearch();
  if (k === 'kink') {
    const [name] = v.split(':');
    let found = false;
    let kinks = search.getAll('kink').map(kStr => {
      const [n, s] = kStr.split(':');
      if (n === name) {
        found = true;
        return v;
      }
      return kStr;
    });
    if (!found) kinks.push(v);
    search.delete('kink');
    kinks.forEach(kink => search.append('kink', kink));
    window.location.hash = `#${search.toString()}`;
  } else if (v === null) {
    search.delete(k);
    window.location.hash = `#${search.toString()}`;
  } else {
    search.set(k, String(v).trim());
    window.location.hash = `#${search.toString()}`;
  }
}

const updateConfig = (config) => {
  document.getElementById('color').value = config?.color;
  document.getElementById('zoom').value = config?.tileWidth;
  document.getElementById('text-zoom').value = config?.textSize;
  document.getElementById('unit-type').value = config?.unit;
  document.getElementById('theme').value = config?.theme;
  document.getElementById('import').value = Object.entries(config.kinks).reduce((all, [k, v]) => {
    return `${all}${v } ${k}\n`
    }, '');
  document.title = `${config.author} - ${config.title}`;
  if (config.sort !== 'custom') {
    document.querySelector('#swap-jars').disabled = true;
  }
  document.getElementById('sort').value = config?.sort;
  document.getElementById('remove-jar').disabled = !Object.keys(config.kinks).length;

  const edit = document.querySelector('#edit');
  edit.addEventListener('click', (e) => {
    const isEditing = !e.target.parentElement.parentElement.open;
    document.body.dataset.edit = isEditing;
    document.querySelector('#title').contentEditable = isEditing;
    document.querySelector('#title').addEventListener('blur', (e) => {
      updateHash('title', e.target.innerText);
    });
    document.querySelector('#author').contentEditable = isEditing;
    document.querySelector('#author').addEventListener('blur', (e) => {
      updateHash('author', e.target.innerText);
    });
    document.querySelector('footer').contentEditable = isEditing;
    document.querySelector('footer').addEventListener('blur', (e) => {
      updateHash('note', e.target.innerText);
    });

    if (!isEditing) {
      delete document.body.dataset.mode;
      updateHash('selected', null);
      draw();
    }
  })


};

const setupConfig = () => {
  document.getElementById('color').addEventListener('change', (e) => {
    updateHash('color', e.target.value);
  })

  document.getElementById('zoom').addEventListener('change', (e) => {
    updateHash('tileSize', e.target.value);
  })

  document.getElementById('text-zoom').addEventListener('change', (e) => {
    updateHash('textSize', e.target.value);
  })
  document.getElementById('sort').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      document.querySelector('#swap-jars').disabled = false;
    }
    updateHash('sort', e.target.value);
    sortKinks(e.target.value);
  })
  document.querySelector('#unit-type').addEventListener('change', (e) => {
    updateHash('unit', e.target.value);
  })
  document.querySelector('#theme').addEventListener('change', (e) => {
    updateHash('theme', e.target.value);
  })
  document.getElementById('profile-address').addEventListener('blur', (e) => {
    updateHash('link', e.target.value);
  })
  document.getElementById('remove-jar').addEventListener('click', (e) => {
    draw();
    updateConfig(getConfig());
    const jars = document.querySelector('#jars > .tile');
    if (document.body.dataset.mode === 'remove' && !jars?.length) {
      delete document.body.dataset.mode;
    } else {
      document.body.dataset.mode = 'remove';
      document.querySelectorAll('.jar').forEach(jar => {
        jar.addEventListener('click', (e) => {
          deleteKink(jar.parentElement.dataset.kink);
          window.setTimeout(() => document.getElementById('remove-jar').click(), 10);
          delete document.body.dataset.mode;
        })
      })
    }
  })
  document.getElementById('swap-jars').addEventListener('click', (e) => {
    draw();
    updateConfig(getConfig());
    const jars = document.querySelector('#jars > .tile');
    if (document.body.dataset.mode === 'swap' && !jars?.length) {
      delete document.body.dataset.mode;
      updateHash('selected', null);
      draw();
    } else {
      document.querySelectorAll('.jar').forEach(jar => {
        document.body.dataset.mode = 'swap';
        jar.addEventListener('click', (e) => {
          const selected = getSearch().get('selected');
          if (selected) {
            swapKinks(selected, jar.parentElement.dataset.kink);
            updateHash('selected', null);
            window.setTimeout(() => document.getElementById('swap-jars').click(), 10);
            delete document.body.dataset.mode;
          } else {
            updateHash('selected', jar.parentElement.dataset.kink);
            window.setTimeout(() => document.getElementById('swap-jars').click(), 10);
            delete document.body.dataset.mode;
          }
        })
      })
    }
  })

  document.getElementById('fetishes').innerHTML = '';
  const empty = document.createElement('option');
  empty.value = "";
  empty.innerText = "Presets";
  document.getElementById('fetishes').appendChild(empty);
  Object.entries(fetishes).forEach(([k, v]) => {
    const option = document.createElement('option');
    option.value = v;
    option.innerText = k;
    document.getElementById('fetishes').appendChild(option);
  })
  document.getElementById('fetishes').addEventListener('change', (e) => {
    document.getElementById('fetish-text').value = e.target.value;
    e.target.selectedIndex = 0;
  })

  document.querySelector('#add-jar').addEventListener('click', (e) => {
    draw();
    updateConfig(getConfig());
    const toAdd = document.getElementById('fetish-text').value?.trim();
    if (toAdd) {
      updateHash('kink', `${toAdd}:0`);
      document.getElementById('fetish-text').value = '';
    }
    sortKinks(getSearch().get('sort'));
  });
}

const draw = () => {
  const c = getConfig();
  // This was developed by Lord @Arx the Dominant
  // https://commons.wikimedia.org/wiki/File:Beakers.svg
  // https://commons.wikimedia.org/wiki/File:Icon-bubbles-by-made-756174.svg

  const root = document.querySelector(':root');
  const total = document.querySelector('h2');
  root.style.setProperty('--bg', c.theme === 'light' ? '#FFF' : '#232323');
  root.style.setProperty('--fg', c.theme === 'light' ? '#000' : '#FFF');
  root.style.setProperty('--kink-color', c.color);
  root.style.setProperty('--tile-width', `${c.tileWidth}px`);
  root.style.setProperty('--text-size', `${c.textSize}px`);
  const jars = document.getElementById('jars');
  const empty = document.getElementById('empty');
  jars.innerHTML = '';
  empty.innerHTML = '';
  const kinks = Object.fromEntries(
    Object.entries(c.kinks).map(([name, ml]) => [name, Math.max(Math.min(ml, MAX), 0)])
  );

  document.querySelector('h1').innerHTML = `${c.title} `;
  const totalMl = Object.values(kinks).reduce((total, cur) => total + cur, 0).toFixed(2);
  total.innerHTML = c.unit === 'volume' ? `${totalMl} ml` : ``;
  document.querySelector('#author').innerHTML = c.author;
  document.querySelector('#author').href = c.link;
  document.querySelector('#date').innerHTML = (new Date()).toISOString().substring(0, 10);
  document.querySelector('h4').innerText = `\u0074\u0065\u006d\u0070\u006c\u0061\u0074\u0065 \u0062\u0079 `;
  document.querySelector('footer').innerHTML = c.note;

  Object.entries(kinks).map(([name, ml]) => {
    const clone = drawBeaker(c, name, ml);
    jars.appendChild(clone);
  });

  if (Object.keys(kinks).length === 0) {
    const beaker = drawBeaker(c, 'Vanilla', MAX);
    empty.appendChild(beaker);
    document.querySelector('.tile').dataset.noKinks = true;
  }

  const tiles = document.querySelectorAll('#jars > .tile > svg');
  Array.from(tiles).forEach(t => {
    t.addEventListener('click', (e) => {
      if (e.target.tagName !== 'button' && !document.body.dataset.mode) {
        const rect = t.getBoundingClientRect();
        let percent = 1 - (e.clientY - rect.top) / rect.height;
        if (percent > 0.955) percent = 1;
        if (percent * MAX < 10) percent = 0;
        updateHash('kink', `${t.parentElement.dataset.kink}:${(MAX * percent).toFixed(2)}`);
      }
    })
  })
};

if (getSearch().get('all') !== null) {
  updateHash('all', null);
  Object.entries(fetishes).forEach(([_, v]) => updateHash('kink', `${v}:0`))
  const search = getSearch();
  window.location.hash = `#${search.toString()}`;
}

draw();
setupConfig();
updateConfig(getConfig());

if (!document.body.querySelectorAll('.tile').length) {
  document.querySelector('#edit').click();
}
window.addEventListener('hashchange', (e) => {
  sortKinks();
  updateConfig(getConfig());
  draw();
})