// ============================================================================
// Backend Test Data Factories
// ============================================================================

// Stock API fixtures
export const createMockStockQuote = (overrides = {}) => ({
  symbol: 'AAPL',
  '01. symbol': 'AAPL',
  '05. price': '150.25',
  '09. change': '2.5',
  '10. change percent': '1.69%',
  ...overrides,
});

export const createMockDailyData = (overrides = {}) => ({
  '1. open': '150.00',
  '2. high': '152.50',
  '3. low': '149.75',
  '4. close': '150.25',
  '5. volume': '50000000',
  ...overrides,
});

// Crypto API fixtures
export const createMockCryptoData = (overrides = {}) => ({
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  current_price: 42500,
  market_cap: 850000000000,
  market_cap_rank: 1,
  total_volume: 25000000000,
  high_24h: 43000,
  low_24h: 41800,
  price_change_24h: 1200,
  price_change_percentage_24h: 2.91,
  ...overrides,
});

export const mockCryptoListResponse = [
  createMockCryptoData({
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 42500,
    market_cap_rank: 1,
  }),
  createMockCryptoData({
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 2250,
    market_cap_rank: 2,
  }),
];

// Sports API fixtures
export const createMockFootballMatch = (overrides = {}) => ({
  idEvent: '123456',
  strEvent: 'Team A vs Team B',
  strLeague: 'English Premier League',
  intHomeScore: 2,
  intAwayScore: 1,
  strStatus: 'Match Finished',
  dateEvent: '2024-01-15',
  timeEvent: '15:00:00',
  strHomeTeam: 'Team A',
  strAwayTeam: 'Team B',
  strCountry: 'England',
  ...overrides,
});

export const createMockCricketMatch = (overrides = {}) => ({
  idEvent: '555555',
  strEvent: 'India vs Australia',
  strLeague: 'ODI',
  strStatus: 'Match Finished',
  strHomeTeam: 'India',
  strAwayTeam: 'Australia',
  intHomeScore: 280,
  intAwayScore: 265,
  dateEvent: '2024-01-20',
  timeEvent: '14:00:00',
  ...overrides,
});

export const mockFootballLiveResponse = {
  results: [
    createMockFootballMatch({
      idEvent: '1',
      strEvent: 'Arsenal vs Liverpool',
      intHomeScore: 2,
      intAwayScore: 1,
    }),
    createMockFootballMatch({
      idEvent: '2',
      strEvent: 'Man City vs Chelsea',
      intHomeScore: 1,
      intAwayScore: 0,
    }),
  ],
};

export const mockCricketLiveResponse = {
  results: [
    createMockCricketMatch({
      idEvent: '1',
      strEvent: 'India vs Australia',
    }),
    createMockCricketMatch({
      idEvent: '2',
      strEvent: 'England vs Pakistan',
    }),
  ],
};

// CSE API fixtures
export const createMockCSEStock = (overrides = {}) => ({
  symbol: 'ASIATEX',
  name: 'Asia Textile Mills',
  lastTradedPrice: 125.5,
  netChange: 2.5,
  percentageChange: 2.03,
  volume: 500000,
  marketCap: 6275000000,
  ...overrides,
});

export const mockCSEStocksResponse = [
  createMockCSEStock({
    symbol: 'ASIATEX',
    lastTradedPrice: 125.5,
    netChange: 2.5,
  }),
  createMockCSEStock({
    symbol: 'DFCC',
    lastTradedPrice: 45.75,
    netChange: -1.0,
  }),
];

// Weather API fixtures
export const createMockWeatherData = (overrides = {}) => ({
  coord: { lon: -73.94, lat: 40.7 },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  main: {
    temp: 22.5,
    feels_like: 20,
    temp_min: 18,
    temp_max: 25,
    pressure: 1013,
    humidity: 65,
  },
  dt: 1234567890,
  sys: { country: 'US' },
  name: 'New York',
  ...overrides,
});

// Health check response
export const createMockHealthResponse = (overrides = {}) => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: 1234.5,
  version: '1.0.0',
  ...overrides,
});

// Error responses
export const createMockErrorResponse = (message = 'Internal Server Error', code = 'INTERNAL_ERROR') => ({
  error: message,
  code,
  timestamp: new Date().toISOString(),
});

// Rate limit error
export const mockRateLimitError = {
  error: 'Rate limit exceeded',
  code: 'RATE_LIMIT_EXCEEDED',
  retryAfter: 60,
  timestamp: new Date().toISOString(),
};

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Create a mock API response with status and headers
 */
export const createMockResponse = (data: unknown, status = 200) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  data,
  headers: {
    'content-type': 'application/json',
  },
});

/**
 * Create a mock API error response
 */
export const createMockApiError = (message: string, status = 500) => ({
  response: {
    status,
    statusText: 'Error',
    data: { error: message },
  },
  message: `Error: ${message}`,
});
