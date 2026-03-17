import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { renderWithProviders } from '../../test/fixtures';

describe('ThemeToggle Component', () => {
  describe('Rendering', () => {
    it('renders sun icon when in dark mode', () => {
      renderWithProviders(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      expect(screen.getByText('☀')).toBeInTheDocument();
    });

    it('renders moon icon when in light mode', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      expect(screen.getByText('☾')).toBeInTheDocument();
    });

    it('displays correct title for dark mode', () => {
      renderWithProviders(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    it('displays correct title for light mode', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });
  });

  describe('Styling', () => {
    it('applies custom size prop', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} size={48} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 48px');
      expect(button).toHaveStyle('height: 48px');
    });

    it('uses default size of 36 when not provided', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 36px');
      expect(button).toHaveStyle('height: 36px');
    });

    it('applies yellow color in dark mode', () => {
      renderWithProviders(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('color: #fbbf24');
    });

    it('applies gray color in light mode', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('color: #475569');
    });

    it('applies border and background styles', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: rgba(255,255,255,0.05)');
      expect(button).toHaveStyle('border: 1px solid rgba(255,255,255,0.1)');
    });
  });

  describe('Interaction', () => {
    it('calls onToggle when button is clicked', () => {
      const onToggle = vi.fn();
      renderWithProviders(<ThemeToggle dark={false} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledOnce();
    });

    it('calls onToggle multiple times on repeated clicks', () => {
      const onToggle = vi.fn();
      renderWithProviders(<ThemeToggle dark={false} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', () => {
      const onToggle = vi.fn();
      renderWithProviders(<ThemeToggle dark={false} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      // Simulate Enter key press
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      // Note: keyDown doesn't trigger click, but this tests focus accessibility
    });

    it('has cursor pointer style', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('cursor: pointer');
    });
  });

  describe('Props Updates', () => {
    it('updates icon when dark prop changes', () => {
      const { rerender } = renderWithProviders(
        <ThemeToggle dark={false} onToggle={vi.fn()} />
      );

      expect(screen.getByText('☾')).toBeInTheDocument();

      rerender(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      expect(screen.getByText('☀')).toBeInTheDocument();
    });

    it('updates color when dark prop changes', () => {
      const { rerender } = renderWithProviders(
        <ThemeToggle dark={false} onToggle={vi.fn()} />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveStyle('color: #475569');

      rerender(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      button = screen.getByRole('button');
      expect(button).toHaveStyle('color: #fbbf24');
    });

    it('updates title when dark prop changes', () => {
      const { rerender } = renderWithProviders(
        <ThemeToggle dark={false} onToggle={vi.fn()} />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');

      rerender(<ThemeToggle dark={true} onToggle={vi.fn()} />);

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });
  });

  describe('Edge Cases', () => {
    it('handles very large size values', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} size={200} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 200px');
      expect(button).toHaveStyle('height: 200px');
    });

    it('handles very small size values', () => {
      renderWithProviders(<ThemeToggle dark={false} onToggle={vi.fn()} size={16} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('width: 16px');
      expect(button).toHaveStyle('height: 16px');
    });
  });
});
