# Kaggle Sats Connection [Extensive List]
## Automatic badges, cards and more for everything Kaggle
*Display stats from your kaggle profile, datasets and notebooks within github. Automatically updated through GitHub Actions.*

## Menu

- **Quickstart**

- **Types of Display**  
    - Shields
    - Cards

- **Items to display**  
    - Profile (TODO)*
    - Kernels
    - Datasets
    - Competitions (TODO)**

*Historical data is collected within history.json, however visualizations over time are not yet integrated*

## Quickstart

Item configs refer to the variables extracted from each used in a custom class or Type item

### Hosting options

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fglarrainv%2Fkaggle-stats%2Ftree%2Fmain)

```url
    https://verceldomain.com/api/card/:cardType/:username/:slug
```

---

### kaggle.shoore.dev API

![Kaggle Stats API - SHOORE](https://img.shields.io/endpoint?url=https%3A%2F%2Fhealthchecks.io%2Fb%2F2%2F2dcb10e3-f763-4345-916d-075319d9cf1e.shields)

 ```url
    https://kaggle.shoore.dev.com/api/:type/:item/:username/:slug
```

### Query & Parameter options

- **Type:** 'card' || 'badge'
- **Item:** 'kernels' || 'datasets'
- **Username:** *Kaggle_Username*
- **Slug:** *item_slug_in_Kaggle*
- **?Theme:** [default = "kaggle"] || dark || terminal

**Kaggle Url:** *https://www.kaggle.com/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data*

**API URL:** */api/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data*

## Kernels

## Datasets

## Notes
- *For profile badges consider [the following repo](https://github.com/subinium/kaggle-badge). 

    - *Users have reported issues with the api connection in their repo, however I have personally not faced any issues.*

- **Competition data is not currently available as I need to familiarize myself with Kaggle competitions first. If there are any metrics publicly visible on Kaggle you consider relevant, consider adding a [suggestion](https://github.com/glarrainv/kaggle-stats/issues/new/choose).