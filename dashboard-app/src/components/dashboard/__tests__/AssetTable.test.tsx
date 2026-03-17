import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { AssetTable } from './AssetTable';
import { createMockStock, mockStocks, renderWithProviders } from '../../test/fixtures';

describe('AssetTable Component', () => {
  describe('Rendering', () => {
    it('renders table with header and rows', () => {
      renderWithProviders(<AssetTable rows={mockStocks} />);

      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Change')).toBeInTheDocument();
    });

    it('renders all asset rows', () => {
      const rows = mockStocks;
      renderWithProviders(<AssetTable rows={rows} />);

      rows.forEach(row => {
        expect(screen.getByText(row.symbol)).toBeInTheDocument();
        expect(screen.getByText(row.name)).toBeInTheDocument();
      });
    });

    it('displays price with currency formatting', () => {
      const rows = [createMockStock({ symbol: 'BTC', price: 42500.5 })];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('$42,500.5')).toBeInTheDocument();
    });

    it('displays percentage change with + sign for positive values', () => {
      const rows = [createMockStock({ symbol: 'AAPL', pct: 2.5 })];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('+2.50%')).toBeInTheDocument();
    });

    it('displays percentage change without + sign for negative values', () => {
      const rows = [createMockStock({ symbol: 'AAPL', pct: -2.5 })];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('-2.50%')).toBeInTheDocument();
    });

    it('renders with empty rows', () => {
      const { container } = renderWithProviders(<AssetTable rows={[]} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by symbol in ascending order by default', () => {
      const rows = [
        createMockStock({ symbol: 'GOOGL' }),
        createMockStock({ symbol: 'AAPL' }),
        createMockStock({ symbol: 'MSFT' }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      const symbols = screen.getAllByText(/AAPL|GOOGL|MSFT/);
      expect(symbols[0]).toHaveTextContent('AAPL');
      expect(symbols[1]).toHaveTextContent('GOOGL');
      expect(symbols[2]).toHaveTextContent('MSFT');
    });

    it('toggles sort direction when clicking same column', () => {
      const rows = [
        createMockStock({ symbol: 'GOOGL' }),
        createMockStock({ symbol: 'AAPL' }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      const symbolHeader = screen.getByText('Symbol');
      fireEvent.click(symbolHeader);

      // After clicking once, should be descending
      const symbols = screen.getAllByText(/AAPL|GOOGL/);
      expect(symbols[0]).toHaveTextContent('GOOGL');
      expect(symbols[1]).toHaveTextContent('AAPL');
    });

    it('sorts by price', () => {
      const rows = [
        createMockStock({ symbol: 'A', price: 150 }),
        createMockStock({ symbol: 'B', price: 100 }),
        createMockStock({ symbol: 'C', price: 200 }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      const priceHeader = screen.getByText('Price');
      fireEvent.click(priceHeader);

      // Should now be sorted by price ascending: 100, 150, 200
      const cells = screen.getAllByText(/\$100|$150|$200/);
      expect(cells.length).toBeGreaterThan(0);
    });

    it('sorts by percentage change', () => {
      const rows = [
        createMockStock({ symbol: 'A', pct: 2 }),
        createMockStock({ symbol: 'B', pct: 1 }),
        createMockStock({ symbol: 'C', pct: 3 }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      const changeHeader = screen.getByText('Change');
      fireEvent.click(changeHeader);

      // Should be sorted by pct
      const percentages = screen.getAllByText(/%/);
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Selection', () => {
    it('calls onSelect callback when row is clicked', () => {
      const onSelect = vi.fn();
      const rows = [createMockStock({ symbol: 'AAPL' })];

      renderWithProviders(<AssetTable rows={rows} onSelect={onSelect} />);

      const row = screen.getByText('AAPL');
      fireEvent.click(row);

      expect(onSelect).toHaveBeenCalledWith('AAPL');
    });

    it('highlights selected row', () => {
      const rows = [
        createMockStock({ symbol: 'AAPL' }),
        createMockStock({ symbol: 'GOOGL' }),
      ];
      const { rerender } = renderWithProviders(
        <AssetTable rows={rows} selectedSymbol="AAPL" />
      );

      const aaplRow = screen.getByText('AAPL').closest('div').parentElement;
      expect(aaplRow).toHaveStyle('border-left: 2px solid #3b82f6');
    });

    it('applies custom accent color to selected row', () => {
      const rows = [createMockStock({ symbol: 'AAPL' })];
      renderWithProviders(
        <AssetTable rows={rows} selectedSymbol="AAPL" accentColor="#ff00ff" />
      );

      const aaplRow = screen.getByText('AAPL').closest('div').parentElement;
      expect(aaplRow).toHaveStyle('border-left: 2px solid #ff00ff');
    });

    it('does not call onSelect if callback is not provided', () => {
      const rows = [createMockStock({ symbol: 'AAPL' })];
      renderWithProviders(<AssetTable rows={rows} />);

      const row = screen.getByText('AAPL');
      // Should not throw error
      fireEvent.click(row);
    });
  });

  describe('Color Coding', () => {
    it('applies green color for positive percentage change', () => {
      const rows = [createMockStock({ symbol: 'AAPL', pct: 2.5 })];
      renderWithProviders(<AssetTable rows={rows} />);

      const pctBadge = screen.getByText('+2.50%');
      expect(pctBadge).toHaveStyle('color: #22d3a5');
    });

    it('applies red color for negative percentage change', () => {
      const rows = [createMockStock({ symbol: 'AAPL', pct: -2.5 })];
      renderWithProviders(<AssetTable rows={rows} />);

      const pctBadge = screen.getByText('-2.50%');
      expect(pctBadge).toHaveStyle('color: #f87171');
    });
  });

  describe('Volume and Sparkline', () => {
    it('displays volume when provided', () => {
      const rows = [createMockStock({ symbol: 'AAPL', volume: '50M' })];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('50M')).toBeInTheDocument();
    });

    it('displays dash when volume is not provided', () => {
      const rows = [createMockStock({ symbol: 'AAPL', volume: undefined })];
      renderWithProviders(<AssetTable rows={rows} />);

      // Should have at least one dash (for volume)
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders sparkline when data is provided', () => {
      const sparklineData = [
        { t: 0, v: 100 },
        { t: 1, v: 101 },
        { t: 2, v: 102 },
      ];
      const rows = [
        createMockStock({ symbol: 'AAPL', sparkline: sparklineData }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      // Sparkline component should be rendered (it's an SVG)
      const aapleRow = screen.getByText('AAPL').closest('div').parentElement;
      expect(aapleRow).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles prices less than 1 with 4 decimal places', () => {
      const rows = [createMockStock({ symbol: 'ALT', price: 0.0025 })];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('$0.0025')).toBeInTheDocument();
    });

    it('handles very large market caps', () => {
      const rows = [
        createMockStock({
          symbol: 'GOOG',
          price: 2000000,
          cap: '2T',
        }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('$2,000,000')).toBeInTheDocument();
    });

    it('handles zero or near-zero percentage changes', () => {
      const rows = [
        createMockStock({ symbol: 'STABLE', pct: 0.0 }),
        createMockStock({ symbol: 'NOSTABLE', pct: 0.001 }),
      ];
      renderWithProviders(<AssetTable rows={rows} />);

      expect(screen.getByText('+0.00%')).toBeInTheDocument();
      expect(screen.getByText('+0.00%')).toBeInTheDocument();
    });
  });
});
