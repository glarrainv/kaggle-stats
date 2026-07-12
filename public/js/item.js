// Badge page: parses the /:SVGtype/:itemType/:username/:slug path, fetches
// item data, and renders preview, stat tiles, bar comparison and embed snippets.

const SVG_TYPES = ['card', 'badge'];

// Client-side copy of the server's CARD_CONFIG stat lists (scripts/types.js)
const STAT_CONFIG = {
  kernels: { kind: 'Kernel', kaggleSlug: 'code', stats: [['upvotes', 'Upvotes'], ['views', 'Views'], ['forks', 'Forks']] },
  datasets: { kind: 'Dataset', kaggleSlug: 'datasets', stats: [['upvotes', 'Upvotes'], ['views', 'Views'], ['downloads', 'Downloads'], ['discussions', 'Topics']] },
};

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en');

const el = (id) => document.getElementById(id);

function setMeta(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute('content', value);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function showError(message) {
  el('item-content').classList.add('hidden');
  el('error-panel').classList.remove('hidden');
  if (message) el('error-message').textContent = message;
}

function parsePath() {
  const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length !== 4) return null;
  const [svgType, itemType, username, slug] = parts;
  if (!SVG_TYPES.includes(svgType) || !STAT_CONFIG[itemType]) return null;
  return { svgType, itemType, username, slug };
}

function renderPreview({ svgType, itemType, username, slug }) {
  const apiPath = `/api/${svgType}/${itemType}/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
  const img = el('preview-img');
  img.addEventListener('load', () => {
    el('preview-skeleton').classList.add('hidden');
    img.classList.remove('hidden');
  });
  img.addEventListener('error', () => showError('The badge image failed to load — the user or slug may not exist.'));
  img.src = apiPath;

  el('preview-heading').textContent = svgType === 'card' ? 'Card preview' : 'Badge preview';
  el('export-link').href = `${location.pathname.replace(/\/+$/, '')}/svg`;

  const sibling = svgType === 'card' ? 'badge' : 'card';
  const toggle = el('toggle-link');
  toggle.textContent = `View as ${sibling}`;
  toggle.href = `/${sibling}/${itemType}/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
}

function renderStats(item, itemType) {
  const row = el('stat-row');
  for (const [key, label] of STAT_CONFIG[itemType].stats) {
    const value = Number(item[key]) || 0;
    const tile = document.createElement('div');
    tile.className = 'stat-tile';

    const labelNode = document.createElement('div');
    labelNode.className = 'stat-label';
    labelNode.textContent = label;

    const valueNode = document.createElement('div');
    valueNode.className = 'stat-value';
    valueNode.textContent = compact.format(value);
    valueNode.title = full.format(value);

    tile.append(labelNode, valueNode);
    row.append(tile);
  }
}

function renderViz(item, itemType) {
  const rows = el('viz-rows');
  const stats = STAT_CONFIG[itemType].stats.map(([key, label]) => [label, Number(item[key]) || 0]);
  // Log scaling mirrors the SVG card renderer so huge view counts don't flatten the rest
  const maxScaled = Math.max(...stats.map(([, v]) => Math.log1p(v)), 1);

  for (const [label, value] of stats) {
    const row = document.createElement('div');
    row.className = 'viz-row';

    const labelNode = document.createElement('span');
    labelNode.className = 'viz-label';
    labelNode.textContent = label;

    const track = document.createElement('div');
    track.className = 'viz-track';

    const bar = document.createElement('div');
    bar.className = 'viz-bar';
    const pct = Math.max((Math.log1p(value) / maxScaled) * 100, value > 0 ? 4 : 1);

    const valueNode = document.createElement('span');
    valueNode.className = 'viz-value';
    valueNode.textContent = full.format(value);

    track.append(bar, valueNode);
    row.append(labelNode, track);
    rows.append(row);

    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = pct + '%'; }));
  }
}

function renderSnippets({ svgType, itemType, username, slug }, title) {
  const origin = location.origin;
  const apiUrl = `${origin}/api/${svgType}/${itemType}/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
  const exportUrl = `${origin}${location.pathname.replace(/\/+$/, '')}/svg`;

  const mdTitle = title.replace(/([\[\]\\])/g, '\\$1');
  const htmlTitle = title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const snippets = [
    ['Markdown', `![${mdTitle}](${apiUrl})`],
    ['HTML', `<img src="${apiUrl}" alt="${htmlTitle}" />`],
    ['Direct URL', apiUrl],
    ['Export URL', exportUrl],
  ];

  const list = el('snippet-list');
  for (const [label, text] of snippets) {
    const wrap = document.createElement('div');
    wrap.className = 'snippet';

    const labelNode = document.createElement('div');
    labelNode.className = 'snippet-label';
    labelNode.textContent = label;

    const box = document.createElement('div');
    box.className = 'snippet-box';

    const code = document.createElement('code');
    code.textContent = text;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = 'Copy';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 1500);
      } catch {
        button.textContent = 'Failed';
      }
    });

    box.append(code, button);
    wrap.append(labelNode, box);
    list.append(wrap);
  }
}

async function init() {
  const params = parsePath();
  if (!params) {
    showError('That address does not match /card-or-badge/kernels-or-datasets/username/slug.');
    return;
  }

  const { itemType, username, slug } = params;
  const config = STAT_CONFIG[itemType];

  el('item-content').classList.remove('hidden');
  renderPreview(params);

  el('item-kind').textContent = config.kind;
  el('item-owner').textContent = username;
  el('kaggle-link').href = `https://www.kaggle.com/${config.kaggleSlug}/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
  el('item-title').textContent = slug;
  document.title = `${slug} — Kaggle Stats`;

  let payload;
  try {
    const res = await fetch(`/api/data/${itemType}/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`);
    payload = await res.json();
    if (!res.ok) {
      showError(payload.error || 'User or slug not found.');
      return;
    }
  } catch {
    showError('Could not reach the API — try refreshing in a moment.');
    return;
  }

  const item = payload.item || {};
  const title = item.title || slug;

  el('item-title').textContent = title;
  document.title = `${title} — Kaggle Stats`;

  const canonicalUrl = `${location.origin}${location.pathname.replace(/\/+$/, '')}`;
  const description = `${title} — ${config.kind} by ${username} on Kaggle. Embed this badge in your GitHub README.`;
  setCanonical(canonicalUrl);
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', `${title} — Kaggle Stats`);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonicalUrl);
  setMeta('meta[name="twitter:title"]', `${title} — Kaggle Stats`);
  setMeta('meta[name="twitter:description"]', description);

  if (item.medal && item.medal !== 'STARTING') {
    const medal = el('item-medal');
    medal.textContent = item.medal;
    medal.classList.remove('hidden');
  }

  renderStats(item, itemType);
  renderViz(item, itemType);
  renderSnippets(params, title);
}

init();
