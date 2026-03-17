# Architecture Guide

## System Overview

The Real-Time Analytics Dashboard is a modern React + TypeScript application providing real-time market data visualization and portfolio management.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Real-Time Dashboard App                      │
│  (React 18 + TypeScript + Vite)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │   UI Components      │         │   State Management   │    │
│  │ ├─ KpiCard          │         │ ├─ useThemeStore   │    │
│  │ ├─ AssetTable       │         │ ├─ useErrorStore   │    │
│  │ ├─ Navbar           │         │ └─ useWatchlist    │    │
│  │ └─ Charts           │         └──────────────────────┘    │
│  └──────────────────────┘                                     │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │  Pages/Features      │         │   Data Layer         │    │
│  │ ├─ Home             │         │ ├─ React Query      │    │
│  │ ├─ Crypto           │         │ ├─ API Client       │    │
│  │ ├─ Sports           │         │ ├─ Error Logger     │    │
│  │ ├─ Portfolio        │         │ └─ WebSocket Hook   │    │
│  │ └─ CSE (Stocks)     │         └──────────────────────┘    │
│  └──────────────────────┘                                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          External APIs & Data Sources                     │ │
│  │  ├─ AlphaVantage (Stocks)                               │ │
│  │  ├─ CoinGecko (Crypto)                                  │ │
│  │  ├─ TheSportsDB (Cricket/Football/Sports)              │ │
│  │  └─ Backend API (http://localhost:5000)                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript strict mode
- **Build Tool**: Vite with code splitting and lazy loading
- **State Management**: Zustand (lightweight, performant)
- **Data Fetching**: TanStack React Query with retry logic
- **Charts**: Recharts (primary), D3.js (advanced charts)
- **Testing**: Vitest + React Testing Library + Playwright
- **Styling**: Inline styles + Tailwind CSS for responsive design

### Backend (Separate Service)
- Node.js + Express
- Axios for external API calls
- Environment-based configuration
- CORS enabled for frontend requests

### Deployment
- **Hosting**: Vercel (serverless frontend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Error Logging

## Project Structure

```
src/
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── KpiCard.tsx      # Key Performance Indicator cards
│   │   ├── AssetTable.tsx   # Sortable asset table
│   │   ├── StatCard.tsx     # Statistics display
│   │   └── Ticker.tsx       # Ticker display
│   ├── charts/              # Charting components
│   │   ├── AreaChart.tsx    # Recharts wrapper
│   │   ├── BarChart.tsx     # Bar chart
│   │   ├── Sparkline.tsx    # Mini inline charts
│   │   └── CandlestickChart.tsx # D3-based
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx       # Top navigation
│   │   ├── AppSidebar.tsx   # Side navigation/watchlist
│   │   └── Sidebar.tsx      # Legacy (deprecated)
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx       # Button variants
│       ├── Card.tsx         # Card container
│       ├── Skeleton.tsx     # Loading placeholder
│       ├── AnimatedCard.tsx # Animation wrapper
│       ├── OptimizedImage.tsx # Lazy-loaded images
│       ├── ErrorBanner.tsx  # Error display
│       └── ErrorToast.tsx   # Toast notifications
│
├── pages/                   # Page components
│   ├── Home/index.tsx       # Dashboard overview (4 KPIs + charts)
│   ├── Crypto/index.tsx     # Crypto prices (table + detail)
│   ├── Sports/index.tsx     # Live sports scores (filtered by league)
│   ├── CSE/index.tsx        # Sri Lanka stock market
│   └── Portfolio/index.tsx  # User portfolio tracking
│
├── hooks/                   # Custom React hooks
│   ├── useWebSocket.ts      # Real-time WebSocket connection
│   ├── useTheme.ts          # Theme management
│   ├── useCryptoData.ts     # Crypto data fetching
│   └── useStockData.ts      # Stock data fetching
│
├── store/                   # Zustand state stores
│   ├── useThemeStore.ts     # Dark/light mode persistence
│   ├── useErrorStore.ts     # Error notifications (toast)
│   ├── useWatchlistStore.ts # Watched assets persistence
│   └── useAlertStore.ts     # User alerts
│
├── services/
│   ├── api/
│   │   └── client.ts        # Enhanced fetch with timeouts + errors
│   └── errorLogger.ts       # Error logging service
│
├── types/
│   └── dashboard.types.ts   # TypeScript interfaces for all data
│
├── utils/                   # Utility functions
│   ├── dashFormat.ts        # Number/currency formatting
│   ├── animations.ts        # Framer Motion presets
│   └── ...
│
├── constants/
│   ├── stocks.ts            # Stock symbols list
│   └── ...
│
├── test/                    # Testing utilities
│   ├── setup.ts             # Vitest global config, mocks
│   ├── fixtures.ts          # Test data factories
│   ├── __tests__/           # Test files (colocated)
│   └── ...
│
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css               # Global styles + Tailwind

public/
└── favicon.svg             # App icon

e2e/                        # End-to-end tests
├── smoke.spec.ts           # Basic functionality
└── navigation.spec.ts      # Navigation flows

.github/workflows/
└── test-and-build.yml      # CI/CD pipeline
```

## Data Flow

### 1. Stocks/Crypto Data Flow

```
User Action (View Crypto page)
  ↓
useQuery ['crypto', 'prices'] in App.tsx
  ↓
apiFetch('/api/crypto/prices')
  ↓
Backend API (http://localhost:5000)
  ↓
External Service (CoinGecko API)
  ↓
Response → React Query Cache
  ↓
Crypto page reads from query (passed as props)
  ↓
CryptoRow component renders with animations
```

### 2. User Interaction Flow

```
User clicks KpiCard / Watchlist Toggle
  ↓
Component calls handler (onClick, onChange)
  ↓
Update Zustand store (useWatchlistStore.add())
  ↓
Store persists to localStorage
  ↓
Component re-renders with new state
  ↓
Optional: Send analytics event
```

### 3. Error Handling Flow

```
API fails or component throws
  ↓
useQuery returns { isError: true, error: Error }
  ↓
Component renders ErrorBanner or catches error
  ↓
useErrorStore.addError() called
  ↓
ErrorToast component displays error
  ↓
Auto-dismiss after 5 seconds or user dismisses
  ↓
errorLogger.logError() called for monitoring
```

## State Management

### React Query (Server State)
- Fetches and caches API data
- Auto-refetch on staleTime expiry
- Retry logic with exponential backoff
- Used for: Stocks, Crypto, Sports, Weather data

```typescript
const { data, isLoading, isError, refetch } = useQuery<StockQuote[]>({
  queryKey: ['stocks', 'batch'],
  queryFn: () => apiFetch('/api/stocks/batch'),
  refetchInterval: 30_000,     // Auto-refetch every 30s
  staleTime: 25_000,           // Data fresh for 25s
});
```

### Zustand (Client State)
- Theme (dark/light mode) → persisted to localStorage
- Watchlist (user favorites) → persisted to localStorage
- Error/Alert notifications → in-memory, auto-clear
- Used for: UI state, user preferences

```typescript
export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () => set(s => ({ isDark: !s.isDark })),
}));
```

### Component Local State (useState)
- Form inputs
- Dropdown selections
- Temporary UI states

## Performance Optimizations

1. **Code Splitting**
   - Each page lazy-loaded with `React.lazy()`
   - Vendor chunks: react, charts, UI, query

2. **Memoization**
   - Components wrapped with `React.memo()`
   - Expensive calculations use `useMemo()`
   - Callbacks use `useCallback()`

3. **Image Optimization**
   - `OptimizedImage` component with lazy loading
   - Fallback placeholders while loading
   - Error handling with icon fallbacks

4. **Bundle Optimization**
   - Vite code splitting: 659KB total, ~185KB gzipped
   - Terser minification with console log removal
   - No sourcemaps in production

5. **Data Fetching**
   - No duplicate queries (single source of truth in App.tsx)
   - cacheTime prevents unnecessary refetches
   - Stale-while-revalidate pattern for UX

## Error Handling Strategy

### Global Error Boundary
```tsx
<ErrorBoundary>
  <App />
  <ErrorToast />
</ErrorBoundary>
```

### Page-Level Error Display
```tsx
const { isError, error, refetch } = useQuery(...);
if (isError) {
  return <ErrorBanner error={error} onRetry={refetch} />;
}
```

### API Level Error Handling
- Timeout: 30 seconds with abort
- Retry: via React Query config
- Error logging: errorLogger.ts logs all failures

## Testing Strategy

- **Unit Tests** (40%+ coverage): Components, hooks, utilities
- **Integration Tests**: Component + state interactions
- **E2E Tests**: Full user workflows with Playwright
- **Coverage Thresholds**: 40% lines, functions, branches, statements

## Animations

### Framer Motion System
- Centralized animation presets in `utils/animations.ts`
- Reusable variants: fadeIn, slideUp, scaleIn, etc.
- AnimatedCard wrapper for consistent animations
- Used for: Page entry, card hover, toast notifications

## Responsive Design

### Breakpoints (Tailwind)
- **Mobile**: < 640px (single column, hamburger menu)
- **Tablet**: 641-1024px (2-3 columns)
- **Desktop**: > 1024px (full layout, sidebars)

### Layout Strategy
- Primary layout uses CSS Grid
- Mobile: stack to single column
- Sidebar: overlay on mobile, fixed on desktop
- Charts: responsive container heights

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` or passwords
   - Use Vercel dashboard for production secrets
   - API_URL validated at build time

2. **CORS**
   - Backend configured to accept frontend domain
   - API calls use secure (https) in production

3. **Error Messages**
   - User-friendly messages (don't expose internals)
   - Detailed errors logged server-side only

4. **Input Validation**
   - API responses validated with TypeScript
   - Search/filter inputs sanitized

## Performance Targets

- **Lighthouse**: > 85 score
- **Bundle**: < 650KB gzipped
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3.5s
- **Test Coverage**: 40%+

## Future Improvements

1. **Performance**
   - Virtual scrolling for large tables
   - Service Worker for offline support
   - Image CDN for faster delivery

2. **Features**
   - User authentication
   - Saved portfolios (server-side)
   - Custom alerts and notifications
   - Historical data export

3. **Monitoring**
   - Real User Monitoring (RUM)
   - Error tracking (Sentry)
   - Performance budgets

4. **Accessibility**
   - ARIA labels for screen readers
   - Keyboard navigation
   - High contrast mode

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
