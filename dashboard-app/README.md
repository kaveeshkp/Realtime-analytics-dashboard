# 📊 Real-Time Analytics Dashboard

A beautiful, full-featured analytics dashboard built with React 18, TypeScript, and modern web technologies. Track stocks, cryptocurrencies, sports scores, and weather data in real-time with interactive charts and visualizations.

![Dashboard Preview](https://via.placeholder.com/1200x600/3b82f6/ffffff?text=Real-Time+Analytics+Dashboard)

## ✨ Features

### Core Features
- 🚀 **Real-time Data Updates** - Live price updates using WebSockets and polling
- 📈 **Interactive Charts** - Beautiful visualizations with Recharts and D3.js
- 🌓 **Dark/Light Mode** - Seamless theme switching with system preference detection
- ⭐ **Watchlist** - Track your favorite assets with persistent storage
- 🔔 **Price Alerts** - Set custom price alerts with browser notifications
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile

### Data Categories
- **Stock Market** - Real-time stock prices from Alpha Vantage API
- **Cryptocurrency** - Top coins and market data from CoinGecko API
- **Sports Scores** - Live match scores from TheSportsDB API
- **Weather** - Current conditions and forecasts (OpenWeatherMap)
- **Portfolio Tracker** - Track investments and calculate P&L

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components, Framer Motion |
| **Charts** | Recharts (primary), D3.js (custom animations) |
| **Real-time** | WebSockets (native), Socket.io-client |
| **State Management** | Zustand (global state), React Query (server state) |
| **APIs** | Alpha Vantage, CoinGecko, OpenWeatherMap, TheSportsDB |
| **Testing** | Vitest, React Testing Library, Playwright |
| **Deployment** | Vercel, GitHub Actions (CI/CD) |

## 📁 Project Structure

```
dashboard-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── charts/              # Chart components (Area, Candlestick, Sparkline, Heatmap)
│   │   ├── dashboard/           # Dashboard components (StatCard, Ticker, AssetTable)
│   │   ├── filters/             # Filter components (SearchBar, TimeRangeSelector)
│   │   ├── layout/              # Layout components (Navbar, Sidebar, ThemeToggle)
│   │   └── ui/                  # shadcn/ui base components
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components (Home, Stocks, Crypto, Sports, Portfolio)
│   ├── services/
│   │   ├── api/                # API service files
│   │   └── websocket/          # WebSocket client
│   ├── store/                   # Zustand stores (watchlist, theme, alerts, portfolio)
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── .env.example                 # Environment variables template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd dashboard-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Alpha Vantage API (Stock Data)
# Get your free API key at: https://www.alphavantage.co/support/#api-key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# CoinGecko API (Crypto Data) - Free tier doesn't require key
VITE_COINGECKO_API_KEY=

# OpenWeatherMap API
# Get your free API key at: https://openweathermap.org/api
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# NewsAPI (Optional)
# Get your free API key at: https://newsapi.org/
VITE_NEWS_API_KEY=your_news_api_key_here

# TheSportsDB API (Free tier)
VITE_SPORTSDB_API_KEY=1

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8080
```

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📚 API Keys & Setup

### Alpha Vantage (Stock Data)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Free tier includes 5 API calls per minute, 100 calls per day

### CoinGecko (Crypto Data)
- Free tier requires no API key
- Rate limit: 10-30 calls/minute
- Documentation: [CoinGecko API](https://www.coingecko.com/en/api/documentation)

### OpenWeatherMap (Weather Data)
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up and get your free API key
3. Free tier: 60 calls/minute, 1,000,000 calls/month

### TheSportsDB (Sports Scores)
- Free tier uses key `1`
- Documentation: [TheSportsDB API](https://www.thesportsdb.com/api.php)

## 🎨 Features Deep Dive

### Real-Time Updates
The dashboard uses a combination of:
- **React Query** for data fetching, caching, and background refetching
- **WebSockets** for real-time price updates (when available)
- **Polling** as a fallback with configurable intervals

### State Management
- **Zustand** for global client state (watchlist, theme, alerts, portfolio)
- **React Query** for server state with automatic cache invalidation
- **localStorage** for data persistence across sessions

### Charts & Visualizations
- **Area Charts** - Stock and crypto price trends
- **Candlestick Charts** - OHLC stock data visualization
- **Sparklines** - Inline 7-day price trends
- **Heatmaps** - Market sector performance (D3.js)

### Theme System
- Light, dark, and system modes
- Smooth transitions using CSS variables
- Persistent theme preference

## 🧪 Testing

Run unit tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

Run E2E tests:
```bash
npm run test:e2e
```

## 📦 Deployment

### Deploy to Vercel

1. **Connect your GitHub repository**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🛣️ Roadmap

### Phase 1 - Setup & Foundation ✅
- [x] Initialize project structure
- [x] Configure Tailwind CSS and shadcn/ui
- [x] Set up routing with React Router v6
- [x] Implement theme system
- [x] Create Zustand stores

### Phase 2 - Data Layer ✅
- [x] API service files
- [x] React Query integration
- [x] Custom hooks for data fetching
- [x] WebSocket client setup

### Phase 3 - Charts & Visualization 🚧
- [x] Area charts with Recharts
- [x] Sparkline components
- [x] D3.js candlestick charts
- [x] Heatmap visualization

### Phase 4 - Features & Pages ✅
- [x] Home dashboard
- [x] Stocks page
- [x] Crypto page
- [x] Sports page
- [x] Portfolio tracker

### Phase 5 - Polish & Deploy 🚧
- [ ] Framer Motion animations
- [ ] Mobile responsiveness
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for chart components
- [D3.js](https://d3js.org/) for custom visualizations
- [Lucide Icons](https://lucide.dev/) for icon system
- API providers: Alpha Vantage, CoinGecko, OpenWeatherMap, TheSportsDB

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Modern Web Technologies**
