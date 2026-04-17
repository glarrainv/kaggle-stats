export const MEDAL_COLORS = {
  GOLD: '#FFD700',
  SILVER: '#C0C0C0',
  BRONZE: '#CD7F32',
  STARTING: '#ffffff',
};

export const CARD_CONFIG = {
  kernels: {
    filterKey: 'kernels',
    slug: 'code',
    headerText: 'Kernel',
    stats: [
      { field: 'upvotes', label: 'Upvotes' },
      { field: 'views', label: 'Views' },
      { field: 'forks', label: 'Forks' },
    ],
  },
  datasets: {
    filterKey: 'datasets',
    slug: 'datasets',
    headerText: 'Dataset',
    stats: [
      { field: 'upvotes', label: 'Upvotes' },
      { field: 'views', label: 'Views' },
      { field: 'downloads', label: 'Downloads' },
      { field: 'discussions', label: 'Topics' },
    ],
  },
};
