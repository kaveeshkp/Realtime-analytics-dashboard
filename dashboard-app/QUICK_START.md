# 🚀 Quick Start Guide

Get your Real-Time Analytics Dashboard up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd c:\Users\kavee\Desktop\REAL\dashboard-app
npm install
```

This will install all required packages including:
- React 18 & React DOM
- TypeScript
- Vite
- Tailwind CSS
- Recharts & D3.js
- Zustand & React Query
- And many more...

## Step 2: Get Your API Keys

### Alpha Vantage (Stocks) - REQUIRED
1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your email and get instant free API key
3. Copy the key (you'll need it in Step 3)

### OpenWeatherMap (Weather) - Optional but Recommended
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API keys section and copy your key

### CoinGecko (Crypto) - No Key Needed!
The CoinGecko API works without an API key for basic usage.

### TheSportsDB (Sports) - Already Configured
Free tier uses key `1` which is already set up.

## Step 3: Configure Environment Variables

The `.env.local` file has been created for you. Edit it and add your API keys:

```bash
# Open .env.local in your editor
notepad .env.local
```

Update these lines with your actual keys:
```env
VITE_ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_KEY_HERE
VITE_OPENWEATHER_API_KEY=YOUR_ACTUAL_KEY_HERE
```

**Important:** The Alpha Vantage key is set to "demo" by default, which has limited functionality. Replace it with your real key for full access.

## Step 4: Start the Development Server

```bash
npm run dev
```

Your dashboard will open automatically at http://localhost:3000

## 🎯 What You'll See

### Home Page
- Overview dashboard with market stats
- Top stocks (AAPL, GOOGL, MSFT)
- Top cryptocurrencies
- Real-time data updates

### Stocks Page
- Live stock prices for major companies
- Sortable table with price, volume, market cap
- Add/remove stocks from watchlist

### Crypto Page
- Top 20 cryptocurrencies by market cap
- 7-day price sparklines
- Real-time price updates
- Market cap and volume data

### Sports Page
- Live sports scores
- Multiple leagues and sports
- Real-time score updates

### Portfolio Page
- Track your investment holdings
- Calculate profit/loss
- See total portfolio value

## 🎨 Theme Toggle

Click the moon/sun icon in the navbar to toggle between:
- Light mode
- Dark mode  
- System preference mode

## ⭐ Using the Watchlist

1. Navigate to Stocks or Crypto page
2. Click the star icon next to any asset
3. View your watchlist in the sidebar (opens on larger screens)
4. Remove items by clicking the X button

## 📊 Exploring Charts

- **Time Range Selector**: Switch between 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- **Interactive Tooltips**: Hover over charts to see detailed data
- **Sparklines**: Quick 7-day trend visualization in tables

## 🔔 Setting up Price Alerts (Future Feature)

This feature is prepared but requires additional WebSocket server setup. See the full README for implementation details.

## 🛠️ Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

Preview the production build:
```bash
npm run preview
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linting
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### API rate limit errors
- Alpha Vantage free tier: 5 calls/min, 100 calls/day
- Wait a minute and try again
- Consider upgrading to paid tier for higher limits

### Charts not displaying
- Check browser console for errors
- Ensure API keys are properly set in `.env.local`
- Restart the dev server after changing environment variables

### Dark mode not working
- Clear browser cache
- Check if system color scheme preference is set
- Try manually toggling with the theme button

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [D3.js Documentation](https://d3js.org/)

## 💡 Next Steps

1. **Customize the default stocks**: Edit `DEFAULT_SYMBOLS` in `src/pages/Stocks.tsx`
2. **Add more crypto coins**: Increase limit in `useTopCryptos(20)` calls
3. **Implement WebSocket server**: For real-time updates (see `src/services/websocket/socketClient.ts`)
4. **Add additional pages**: Weather page, News feed, etc.
5. **Customize theme colors**: Edit `src/index.css` CSS variables

## 🤝 Need Help?

- Check the main README.md for detailed documentation
- Review component files for implementation examples
- Open an issue on GitHub for bugs or questions

---

**Happy Analyzing! 📈✨**
