import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';

// ============================================================================
// Test Data Factories
// ============================================================================

// Stock data fixture
export const createMockStock = (overrides = {}) => ({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 150.25,
  change: 2.5,
  changePercent: 1.69,
  volume: 50000000,
  marketCap: 2450000000000,
  ...overrides,
});

export const mockStocks = [
  createMockStock({ symbol: 'AAPL', name: 'Apple Inc.', price: 150.25 }),
  createMockStock({ symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.5 }),
  createMockStock({ symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.75 }),
];

// Crypto data fixture
export const createMockCrypto = (overrides = {}) => ({
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
  circulating_supply: 21000000,
  total_supply: 21000000,
  ath: 69000,
  atl: 65,
  sparkline_in_7d: {
    price: [42000, 42100, 42200, 42300, 42400, 42500, 42600],
  },
  ...overrides,
});

export const mockCryptos = [
  createMockCrypto({
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 42500,
    market_cap_rank: 1,
  }),
  createMockCrypto({
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 2250,
    market_cap_rank: 2,
  }),
  createMockCrypto({
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.98,
    market_cap_rank: 3,
  }),
];

// Sports data fixture
export const createMockMatch = (overrides = {}) => ({
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

export const mockMatches = [
  createMockMatch({
    idEvent: '1',
    strEvent: 'Arsenal vs Liverpool',
    strHomeTeam: 'Arsenal',
    strAwayTeam: 'Liverpool',
    intHomeScore: 2,
    intAwayScore: 1,
  }),
  createMockMatch({
    idEvent: '2',
    strEvent: 'Man City vs Chelsea',
    strHomeTeam: 'Man City',
    strAwayTeam: 'Chelsea',
    intHomeScore: 1,
    intAwayScore: 0,
  }),
];

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
  ...overrides,
});

export const mockCricketMatches = [
  createMockCricketMatch({
    idEvent: '1',
    strEvent: 'India vs Australia',
    intHomeScore: 280,
    intAwayScore: 265,
  }),
  createMockCricketMatch({
    idEvent: '2',
    strEvent: 'England vs Pakistan',
    intHomeScore: 310,
    intAwayScore: 298,
  }),
];

// Portfolio data fixture
export const createMockPortfolioItem = (overrides = {}) => ({
  symbol: 'AAPL',
  shares: 10,
  averagePrice: 150,
  currentPrice: 155,
  weight: 0.25,
  ...overrides,
});

export const mockPortfolioItems = [
  createMockPortfolioItem({
    symbol: 'AAPL',
    shares: 10,
    averagePrice: 150,
    currentPrice: 155,
  }),
  createMockPortfolioItem({
    symbol: 'GOOGL',
    shares: 5,
    averagePrice: 130,
    currentPrice: 140,
  }),
];

// Weather data fixture
export const createMockWeather = (overrides = {}) => ({
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
  clouds: { all: 0 },
  dt: 1234567890,
  ...overrides,
});

// ============================================================================
// Custom Test Render Function with Providers
// ============================================================================

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

export const renderWithProviders = (
  ui: ReactNode,
  { queryClient = createTestQueryClient(), ...renderOptions }: ExtendedRenderOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
};

// ============================================================================
// Mock Service Worker (MSW) Setup Utilities
// ============================================================================

export const mockApiResponses = {
  successResponse: (data: unknown) => ({
    status: 200,
    ok: true,
    json: async () => data,
  }),
  errorResponse: (status = 500, message = 'Server Error') => ({
    status,
    ok: false,
    json: async () => ({ error: message }),
  }),
};

// ============================================================================
// Async Test Utilities
// ============================================================================

export const waitForElement = async (callback: () => Element, options = { timeout: 1000 }) => {
  const startTime = Date.now();
  while (Date.now() - startTime < options.timeout) {
    try {
      return callback();
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  throw new Error('Element not found within timeout');
};
