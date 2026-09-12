export const API_KEY_1 = 'YOUR_YOUTUBE_API_KEY_1';
export const API_KEY_2 = 'YOUR_YOUTUBE_API_KEY_2';

export const apiKeys = [API_KEY_1, API_KEY_2];

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const predefinedSearches = {
  sparkingZero: {
    id: 'sparkingZero',
    label: 'Dragon Ball Sparking Zero',
    searchQuery: 'Dragon Ball Sparking Zero',
  },
  gekishin: {
    id: 'gekishin',
    label: 'Dragon Ball Gekishin Squadra',
    searchQuery: 'Dragon Ball Gekishin Squadra',
  },
  xenoverse2: {
    id: 'xenoverse2',
    label: 'Dragon Ball Xenoverse 2',
    searchQuery: 'Dragon Ball Xenoverse 2',
  },
  gta6: {
    id: 'gta6',
    label: 'GTA 6',
    searchQuery: 'GTA 6',
  },
};

export const supportedPeriods = {
  last7Days: { label: 'Últimos 7 días', amount: 7, unit: 'days' },
  last14Days: { label: 'Últimos 14 días', amount: 14, unit: 'days' },
  last2Months: { label: 'Últimos 2 meses', amount: 2, unit: 'months' },
  last3Months: { label: 'Últimos 3 meses', amount: 3, unit: 'months' },
  last6Months: { label: 'Últimos 6 meses', amount: 6, unit: 'months' },
  last12Months: { label: 'Últimos 12 meses', amount: 12, unit: 'months' },
};
