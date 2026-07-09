# Kaggle Badges and Cards
*Display stats from your kaggle profile, datasets and notebooks within github. Automatically updated through GitHub Actions.*

## Menu

- **Quickstart**

- **Types of Display**  
    - Badges
    - Cards

- **Items to display**  
    - Profile (TODO)*
    - Kernels
    - Datasets
    - Competitions (TODO)**
    - History Management(TODO)

## Quickstart

Item configs refer to the variables extracted from each used in a custom class or Type item

### Hosting options

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fglarrainv%2Fkaggle-stats%2Ftree%2Fmain)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/glarrainv/kaggle-stats)

```url
    https://yourdomain.com/api/:SVGtype/:itemType/:username/:slug
```

*Note: on serverless hosts the rate limiter's in-memory store is per-instance, so limits reset across cold starts.*

On Netlify, the weekly health-check ping runs as a [Scheduled Function](netlify/functions/health-check.js) (Netlify's own cron, since functions don't stay alive between invocations like `node-cron` needs). Set `LIVE_URL`, `LIVE_CHECK` and `ERROR_CHECK` under Site settings → Environment variables for it to run; without `LIVE_URL` it's skipped.

### Website

The deployed site ships a frontend alongside the API:

- **`/`** — Badge Generator: pick display type, item type, username and slug, with a live preview.
- **`/:SVGtype/:itemType/:username/:slug`** — badge page with the rendered SVG, stat tiles, a comparison chart and copy-paste embed snippets.
- **`/:SVGtype/:itemType/:username/:slug/svg`** — the raw exportable SVG.
- **`/api/data/:itemType/:username/:slug`** — item stats as JSON.

### kaggle.shoore.dev API

![Kaggle Stats API - SHOORE](https://img.shields.io/endpoint?url=https%3A%2F%2Fhealthchecks.io%2Fb%2F2%2F2dcb10e3-f763-4345-916d-075319d9cf1e.shields)

 ```url
    https://kaggle.shoore.dev.com/api/:SVGtype/:itemType/:username/:slug
```

### Parameter options

| Parameter Name | Description | Possible Values |
| -------------- | ----------- | --------------- |
| **SVGType:**   | Type of visual used to display stats | 'card', 'badge' |
| **ItemTType:** | Type of the object retrieved | 'kernels', 'datasets' |
| **Username:**  | Kaggle username of the item's owner | *Kaggle Username* |
| **Slug:**      | Slug name of object to retrieve | *Item Slug In Kaggle* |
**Theme Argument**| TODO | TODO |

### Example API
**Kaggle Url:** *https://www.kaggle.com/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data*   
**API URL:** */api/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data*

---

## Kernels
![ML Visuals](https://kaggle.shoore.dev/api/badge/kernels/gasparlarrainvaras/advanced-ml-and-visualizations)
![Aquascale](https://kaggle.shoore.dev/api/badge/kernels/mah20050/aquascale-master)

![ML Visuals](https://kaggle.shoore.dev/api/card/kernels/gasparlarrainvaras/advanced-ml-and-visualizations)
![Aquascale](https://kaggle.shoore.dev/api/card/kernels/mah20050/aquascale-master)

## Datasets
![Rapids Dataset Badge](https://kaggle.shoore.dev/api/badge/datasets/cdeotte/rapids)
![Data Club Historical Dataset Badge](https://kaggle.shoore.dev/api/badge/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data)

![Rapids Dataset Card](https://kaggle.shoore.dev/api/card/datasets/cdeotte/rapids)
![Data Club Historical Dataset Card](https://kaggle.shoore.dev/api/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data)


## Notes
**This project is still under development contributions of any kind are encouraged.**

- *For profile badges consider [the following repo](https://github.com/subinium/kaggle-badge). 

    - *Users have reported issues with the api connection in their repo, however I have personally not faced any issues.*

- **Competition data is not currently available as I need to familiarize myself with Kaggle competitions first. If there are any metrics publicly visible on Kaggle you consider relevant, consider adding a [suggestion](https://github.com/glarrainv/kaggle-stats/issues/new/choose).
