# Kaggle Badges and Cards
*Display stats from your kaggle profile, datasets and notebooks within github.*   

### Sponsors

[![SHOORE Badge](https://img.shields.io/badge/shoore-DEV-fffbde?style=plastic&label=SHOORE&labelColor=fffbde&color=749bc2&link=https%3A%2F%2Fshoore.dev%2F)](https://shoore.dev)
## Quickstart

### Hosting options

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fglarrainv%2Fkaggle-stats%2Ftree%2Fmain)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/glarrainv/kaggle-stats)

```url
    https://yourdomain.com/:SVGtype/:itemType/:username/:slug
```

###

### kaggle.shoore.dev API

[![Kaggle.Shoore.Dev](https://img.shields.io/endpoint?url=https%3A%2F%2Fhealthchecks.io%2Fb%2F2%2F2dcb10e3-f763-4345-916d-075319d9cf1e.shields)](https://kaggle.shoore.dev/) - [kaggle.shoore.dev](https://kaggle.shoore.dev) 
### Parameter options

| Parameter Name | Description | Possible Values |
| -------------- | ----------- | --------------- |
| **SVGType:**   | Type of visual used to display stats | 'card', 'badge' |
| **ItemTType:** | Type of the object retrieved | 'kernels', 'datasets' |
| **Username:**  | Kaggle username of the item's owner | *Kaggle Username* |
| **Slug:**      | Slug name of object to retrieve | *Item Slug In Kaggle* |
|**Theme Argument** | TODO | TODO |

### Example API

**Kaggle Url:** *https://www.kaggle.com/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data*


**API URL:** *[https://kaggle.shoore.dev/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data](https://kaggle.shoore.dev/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data)*

---
### Example SVGs

#### Kernels
![ML Visuals](https://kaggle.shoore.dev/api/badge/kernels/gasparlarrainvaras/advanced-ml-and-visualizations)
![Aquascale](https://kaggle.shoore.dev/api/badge/kernels/mah20050/aquascale-master)

![ML Visuals](https://kaggle.shoore.dev/api/card/kernels/gasparlarrainvaras/advanced-ml-and-visualizations)
![Aquascale](https://kaggle.shoore.dev/api/card/kernels/mah20050/aquascale-master)

#### Datasets
![Rapids Dataset Badge](https://kaggle.shoore.dev/api/badge/datasets/cdeotte/rapids)
![Data Club Historical Dataset Badge](https://kaggle.shoore.dev/api/badge/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data)

![Rapids Dataset Card](https://kaggle.shoore.dev/api/card/datasets/cdeotte/rapids)
![Data Club Historical Dataset Card](https://kaggle.shoore.dev/api/card/datasets/gasparlarrainvaras/notre-dame-data-club-2026-historical-data)


## Notes
**This project is still under development contributions of any kind are encouraged.**

- *For profile badges consider [the following repo](https://github.com/subinium/kaggle-badge). 

    - *Users have reported issues with the api connection in their repo, however I have personally not faced any issues.*

- **Competition data is not currently available as I need to familiarize myself with Kaggle competitions first. If there are any metrics publicly visible on Kaggle you consider relevant, consider adding a [suggestion](https://github.com/glarrainv/kaggle-stats/issues/new/choose).
