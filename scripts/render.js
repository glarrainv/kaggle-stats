import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('../config.json');

// ── type config ───────────────────────────────────────────────────────────────
const CARD_TYPES = {
  notebooks: {
    filterKey: 'notebooks',         
    headerText: 'Kernel',
    stats: [
      { field: 'upvotes', label: 'Upvotes' },
      { field: 'views',   label: 'Views'   },
      { field: 'forks',   label: 'Forks'   },
    ],
  },
  datasets: {
    filterKey: 'datasets',
    headerText: 'Dataset',
    stats: [
      { field: 'upvotes',     label: 'Upvotes'    },
      { field: 'views',       label: 'Views'      },
      { field: 'downloads',   label: 'Dwnld'  },
      { field: 'discussions', label: 'Topics'     },
    ],
  },
};

// ── constants ─────────────────────────────────────────────────────────────────
const BAR_Y = 120;
const BAR_HEIGHT = 30;
const BAR_X = 50;
const BAR_WIDTH = 300;
const BAR_RX = 20;

const LOG_BASE = 0.05;

const NAME_SIZE = 14;
const VALUE_SIZE = 16;


const colorOrder = [
    '#20BEFF',
    '#1a9bce',
    '#156788',
    '#07414a'
];

const STROKE = '#47494D';
const { targetids } = config;

const USERNAME = targetids.user;


// ── MAIN ──────────────────────────────────────────────────────────────────────
function main() {

const history = JSON.parse(fs.readFileSync('./scripts/history/history.json', 'utf8'));
const latest = history.at(-1);

for (const [typeName, typeConfig] of Object.entries(CARD_TYPES)) {
  const items = latest.data.filter((item) => item[typeConfig.filterKey] != null);

  fs.mkdirSync(`./assets/${typeName}`, { recursive: true });

  for (const item of items) {
    const svg      = buildSVG(item, typeConfig);
    const filename = `${item[typeConfig.filterKey]}.svg`;
    const outPath  = path.join(`./assets/${typeName}`, filename);
    fs.writeFileSync(outPath, svg);
    console.log(`Rendered → ${outPath}`);
  }

  console.log(`Done. ${items.length} ${typeName} card(s) written.`);
}
}
// String helper functions for clean formatting
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n ?? 0));

const truncate = (str, max) =>
    str.length > max ? str.slice(0, max - 1) + '…' : str;

// Handles ranking of all fields, adjusting bar sizing, colors and respective labels accordingly
function rankStats(item, statDefs) {
  const stats = statDefs
    .map(({ field, label }) => ({ label, value: item[field] ?? 0 }))
    .sort((a, b) => b.value - a.value);

  const maxVal = stats[0].value || 1;

  // MIN_WIDTHS: largest always full, then descending floors
  // Works for any length — only index 1 and 2+ get floors
  const MIN_WIDTHS = stats.map((_, i) => {
    if (i === 0) return BAR_WIDTH;
    console.log((stats.length - (i)) * 30);
    return Math.max((stats.length - (i)) * 30, 30);
  });

  return stats.map((s, i) => {
    const ratio = s.value > 0 ? Math.log1p(s.value * LOG_BASE) / Math.log1p(maxVal * LOG_BASE) : 0;
    const rawWidth = Math.round(ratio * BAR_WIDTH);
    const width    = Math.max(rawWidth, MIN_WIDTHS[i]);

    return {
      ...s,
      color:  colorOrder[Math.min(i, colorOrder.length - 1)],
      width:  width,
    };
  });
}


// Creates SVG rect bars according to ranked stats
function buildBar(ranked) {
    return ranked
        .map((s) => {
            const rect = `
  <rect
    x="${BAR_X}" y="${BAR_Y}"
    width="${s.width}" height="${BAR_HEIGHT}"
    rx="${BAR_RX}"
    fill="${s.color}" stroke="${STROKE}" stroke-width="2"/>`;
            return rect;
        })
        .join('');
}

// Labels: value stacked on top of label name, centered above each bar
function buildLabels(ranked) {
    const LABEL_Y = BAR_Y - NAME_SIZE + 6;  // label name baseline
    const VALUE_Y = LABEL_Y - VALUE_SIZE;    // value baseline above label

    let LabelX = BAR_WIDTH + ( BAR_WIDTH / ranked.length);  // start near the left, with some padding
    return ranked
        .map((s) => {
            LabelX -= BAR_WIDTH / ranked.length;
            return `
  <text x="${LabelX}" y="${VALUE_Y}" fill="${s.color}" class="t m o" font-size="${VALUE_SIZE}">${fmt(s.value)}</text>
  <text x="${LabelX}" y="${LABEL_Y}" fill="#000000" class="m" font-size="${NAME_SIZE}">${s.label}</text>`;
        })
        .join('');
}

function buildSVG(item, typeConfig) {
  const { title, medal = 'STARTING' } = item;

  const ranked = rankStats(item, typeConfig.stats);
  const bars   = buildBar(ranked);
  const labels = buildLabels(ranked);
  const display = truncate(title, 45);

  const MedalColors = {
    GOLD:     '#FFD700',
    SILVER:   '#C0C0C0',
    BRONZE:   '#CD7F32',
    STARTING: '#ffffff',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 200" fill="none">
<style>
  text { font-family: Verdana, sans-serif; }
  .t   { font-weight: bold; }
  .m   { text-anchor: middle; }
  .e   { font-weight: bold; text-anchor: end; }
  .o   { paint-order: stroke; stroke: #47494D; stroke-width: 2px; }
</style>
<rect x="25" y="25" rx="50" width="350" height="175" fill="#F5F5F5" stroke="${MedalColors[medal]}" stroke-width="5"/>
<text fill="${MedalColors[medal]}" font-size="15" x="200" y="45"  class="t m o">${medal}</text>
<text fill="#20BEFF" font-size="30" x="200" y="70" class="t m o">${typeConfig.headerText}</text>
${bars}
${labels}
<text x="200" y="170" fill="#000000" class="t m" font-size="11">${display}</text>
<text x="200" y="190" fill="#000000" class="m"    font-size="16">${USERNAME}</text>
</svg>`;
}


// Run main function
main()