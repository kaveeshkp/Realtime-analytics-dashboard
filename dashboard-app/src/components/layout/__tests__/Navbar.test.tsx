import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from './Navbar';
import { renderWithProviders } from '../../test/fixtures';

describe('Navbar Component', () => {
  const mockNavItems = [
    { id: 'home', label: 'Home', icon: '📊' },
    { id: 'stocks', label: 'Stocks', icon: '📈' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
  ];

  const mockTicker = [
    { symbol: 'AAPL', pct: 2.5 },
    { symbol: 'GOOGL', pct: -1.2 },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders logo with DASHFLOW text', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText('DASHFLOW')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      mockNavItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('renders theme toggle button', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const themeButton = screen.getByTitle('Toggle theme');
      expect(themeButton).toBeInTheDocument();
    });

    it('shows sun icon when in dark mode', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={true}
          onToggleTheme={vi.fn()}
        />
      );

      const themeButton = screen.getByTitle('Toggle theme');
      expect(themeButton).toHaveTextContent('☀');
    });

    it('shows moon icon when in light mode', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const themeButton = screen.getByTitle('Toggle theme');
      expect(themeButton).toHaveTextContent('☾');
    });
  });

  describe('Navigation', () => {
    it('highlights the current page', () => {
      renderWithProviders(
        <Navbar
          page="stocks"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const stocksButton = screen.getByText('Stocks');
      expect(stocksButton).toHaveStyle('color: #22d3a5');
    });

    it('calls onNavigate when nav item is clicked', () => {
      const onNavigate = vi.fn();
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={onNavigate}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const stocksButton = screen.getByText('Stocks');
      fireEvent.click(stocksButton);

      expect(onNavigate).toHaveBeenCalledWith('stocks');
    });

    it('does not highlight inactive pages', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const cryptoButton = screen.getByText('Crypto');
      expect(cryptoButton).toHaveStyle('color: #64748b');
    });
  });

  describe('Theme Toggle', () => {
    it('calls onToggleTheme when theme button is clicked', () => {
      const onToggleTheme = vi.fn();
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={onToggleTheme}
        />
      );

      const themeButton = screen.getByTitle('Toggle theme');
      fireEvent.click(themeButton);

      expect(onToggleTheme).toHaveBeenCalled();
    });
  });

  describe('Ticker Display', () => {
    it('displays ticker data when provided', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={mockTicker}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('+2.50%')).toBeInTheDocument();
    });

    it('cycles through ticker items every 3 seconds', async () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={mockTicker}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      // Initially should show first item
      expect(screen.getByText('AAPL')).toBeInTheDocument();

      // After 3 seconds, should show second item
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
      });
    });

    it('shows correct color for positive percentage', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={[{ symbol: 'AAPL', pct: 2.5 }]}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const percentageSpan = screen.getByText('+2.50%');
      expect(percentageSpan).toHaveStyle('color: #22d3a5');
    });

    it('shows correct color for negative percentage', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={[{ symbol: 'GOOGL', pct: -1.2 }]}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const percentageSpan = screen.getByText('-1.20%');
      expect(percentageSpan).toHaveStyle('color: #f87171');
    });

    it('handles empty ticker gracefully', () => {
      const { container } = renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={[]}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          ticker={mockTicker}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Watchlist Button', () => {
    it('renders watchlist button when onOpenWatchlist is provided', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
          onOpenWatchlist={vi.fn()}
        />
      );

      const watchlistButton = screen.getByTitle('Watchlist');
      expect(watchlistButton).toBeInTheDocument();
    });

    it('does not render watchlist button when onOpenWatchlist is not provided', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      const watchlistButton = screen.queryByTitle('Watchlist');
      expect(watchlistButton).not.toBeInTheDocument();
    });

    it('calls onOpenWatchlist when watchlist button is clicked', () => {
      const onOpenWatchlist = vi.fn();
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={mockNavItems}
          dark={false}
          onToggleTheme={vi.fn()}
          onOpenWatchlist={onOpenWatchlist}
        />
      );

      const watchlistButton = screen.getByTitle('Watchlist');
      fireEvent.click(watchlistButton);

      expect(onOpenWatchlist).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles single nav item', () => {
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={[{ id: 'home', label: 'Home', icon: '📊' }]}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles very long nav item labels', () => {
      const longLabel = 'A'.repeat(50);
      renderWithProviders(
        <Navbar
          page="home"
          onNavigate={vi.fn()}
          navItems={[{ id: 'test', label: longLabel, icon: '📊' }]}
          dark={false}
          onToggleTheme={vi.fn()}
        />
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });
});
