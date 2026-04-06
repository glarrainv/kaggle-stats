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
const BAR_TOP = 120;
const BAR_HEIGHT = 200;
const BAR_X = 125;
const BAR_WIDTH = 30;
const BAR_RX = 15;

const LOG_BASE = 20;

const TEXT_X = 230; // x anchor for the value number
const NAME_SIZE = 14;
const NAME_OFFSET = 5;  // gap between value baseline and name baseline
const MIN_GAP = 8 


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

  // MIN_HEIGHTS: largest always full, then descending floors
  // Works for any length — only index 1 and 2+ get floors
  const MIN_HEIGHTS = stats.map((_, i) => {
    if (i === 0) return BAR_HEIGHT;
    if (i === 1) return 40;
    return 10;
  });

  return stats.map((s, i) => {
    const logB = (x) => Math.log1p(x) / Math.log(LOG_BASE);

    const logRatio = s.value > 0
    ? logB(s.value) / logB(maxVal)
    : 0;
    const rawHeight = Math.round(logRatio * BAR_HEIGHT);
    const height    = Math.max(rawHeight, MIN_HEIGHTS[i]);

    return {
      ...s,
      color:  colorOrder[Math.min(i, colorOrder.length - 1)],
      height,
    };
  });
}


// Creates SVG rect bars according to ranked stats
function buildBar(ranked) {
    return ranked
        .map(
            (s) => `
  <rect
    x="${BAR_X}" y="${BAR_TOP + (BAR_HEIGHT - s.height)}"
    width="${BAR_WIDTH}" height="${s.height}"
    rx="${BAR_RX}"
    fill="${s.color}" stroke="${STROKE}" stroke-width="2"/>`
        )
        .join('');
}

//Label sizing and positioning.
// [Value] + [Name]
function buildLabels(ranked) {
    let VALUE_SIZE = 18;
    let CHECK_VALUE = 4; // Length limit for label for dynamic sizing
    // Minimum gap enforcement
    function resolvePositions(ranked) {
        const positions = ranked.map((s) => BAR_TOP + (BAR_HEIGHT - s.height) + 30);

        // Walk from smallest (index 2) up to largest (index 0).
        // Each block must not overlap the one below it (higher index = lower on card = larger y).
        for (let i = ranked.length - 2; i >= 0; i--) {
            const blockBelow = positions[i + 1];                        // value y of the block below
            const maxAllowedY = blockBelow - VALUE_SIZE - MIN_GAP; // our name baseline must sit above this
            if (positions[i] > maxAllowedY) {
                positions[i] = maxAllowedY;
            }
        }

        return positions;
    }

    const positions = resolvePositions(ranked)


    return ranked
        .map((s, i) => {
            const Y = positions[i];          // baseline sits inside bar top area
            const NAME_X = TEXT_X + NAME_OFFSET;
            if (fmt(s.value).length <= CHECK_VALUE) {
                VALUE_SIZE += 4; // Increase font size for shorter values
                CHECK_VALUE = Math.floor(fmt(s.value).length / 2);
            }
            return `
  <text x="${TEXT_X}" y="${Y}" fill="${s.color}" class="t o e" font-size="${VALUE_SIZE}">${fmt(s.value)}</text>
  <text x="${NAME_X}" y="${Y}" fill="#000000" font-size="${NAME_SIZE}">${s.label}</text>`;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
<style>
  text { font-family: Verdana, sans-serif; }
  .t   { font-weight: bold; }
  .m   { text-anchor: middle; }
  .e   { font-weight: bold; text-anchor: end; }
  .o   { paint-order: stroke; stroke: #47494D; stroke-width: 2px; }
</style>
<rect x="87.5" y="25" rx="50" width="225" height="350" fill="#F5F5F5" stroke="${MedalColors[medal]}" stroke-width="5"/>
<text fill="${MedalColors[medal]}" font-size="20" x="200" y="70"  class="t m o">${medal}</text>
<text fill="#20BEFF" font-size="40" x="200" y="105" class="t m o">${typeConfig.headerText}</text>
${bars}
${labels}
<text x="200" y="340" fill="#000000" class="t m" font-size="7">${display}</text>
<text x="200" y="355" fill="#000000" class="m"    font-size="12">${USERNAME}</text>
</svg>`;
}


// Run main function
main()