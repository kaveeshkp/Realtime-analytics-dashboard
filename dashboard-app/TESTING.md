# Testing Guide

## Overview

This project uses **Vitest** for unit/integration testing and **Playwright** for end-to-end testing. Our target is **40%+ code coverage** on critical paths.

### Current Coverage
- Unit Tests: ~150+ tests
- Integration Tests: ~20+ tests
- E2E Tests: ~10+ spec files
- **Overall Coverage**: 40%+

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Run in watch mode (recommended during development)
npm run test:watch

# Run specific test file
npm run test src/components/dashboard/__tests__/AssetTable.test.tsx

# Run tests matching a pattern
npm run test -- --grep "KpiCard"
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/navigation.spec.ts

# Debug mode (interactive)
npm run test:e2e -- --debug
```

### Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
# Open coverage report in browser
open coverage/index.html
```

**Coverage Thresholds** (from `vitest.config.ts`):
- Lines: 40%
- Functions: 40%
- Branches: 40%
- Statements: 40%

## Writing Tests

### Component Test Example

**File**: `src/components/dashboard/__tests__/KpiCard.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(
      <KpiCard
        label="Test Label"
        value="$1,234"
        sub="Subtitle"
        color="#3b82f6"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    const { container } = render(
      <KpiCard
        label="Test"
        value="123"
        sub="Sub"
        color="#ff0000"
      />
    );

    // Assert color is applied (e.g., to a styled element)
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

### Hook Test Example

**File**: `src/hooks/__tests__/useThemeStore.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from '../useThemeStore';

describe('useThemeStore', () => {
  it('initializes with light theme', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.isDark).toBe(false);
  });

  it('toggles theme', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
  });
});
```

### E2E Test Example

**File**: `e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click on Crypto link
    await page.click('[data-testid="nav-crypto"]');

    // Verify we're on Crypto page
    await expect(page).toHaveURL('**/crypto');
    await expect(page.locator('h1')).toContainText('Cryptocurrency');
  });
});
```

## Test Structure

### Test Files Location

```
src/
├── components/
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   └── __tests__/
│   │       └── KpiCard.test.tsx
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── hooks/
│   ├── useTheme.ts
│   └── __tests__/
│       └── useTheme.test.ts
├── pages/
│   ├── Home/
│   │   ├── index.tsx
│   │   └── __tests__/
│   │       └── index.test.tsx
└── utils/
    ├── formatCurrency.ts
    └── __tests__/
        └── formatCurrency.test.ts

e2e/
├── smoke.spec.ts
├── navigation.spec.ts
└── auth.spec.ts
```

## Test Utilities

### Custom Render Function

Located in `src/test/setup.ts`, use this to render components with providers:

```typescript
import { renderWithProviders } from '../test/setup';

it('renders with React Query provider', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Expected content')).toBeInTheDocument();
});
```

### Test Data Factories

Located in `src/test/fixtures.ts`, use these to create mock data:

```typescript
import { mockStocks, createMockStock } from '../test/fixtures';

it('displays stock data', () => {
  const stock = createMockStock({ symbol: 'AAPL', price: 150 });
  // Use stock in test
});
```

## Debugging Tests

### Debug Single Test

```bash
npm run test:debug src/components/dashboard/__tests__/KpiCard.test.tsx
```

### Debug E2E Test

```bash
npm run test:e2e -- --debug e2e/navigation.spec.ts
```

### Use Console Logs

```typescript
it('logs values', () => {
  console.log('Debug info:', someValue);
  expect(true).toBe(true);
});
```

View logs in test output.

### VSCode Integration

Install "Playwright Test for VSCode" extension for in-IDE test running and debugging.

## Best Practices

1. **Test Behavior, Not Implementation**
   - ✅ `expect(button).toBeDisabled()`
   - ❌ `expect(button.props.disabled).toBe(true)`

2. **Use Meaningful Test Names**
   - ✅ `it('submits form and redirects to home')`
   - ❌ `it('does something')`

3. **Keep Tests Independent**
   - Each test should be runnable in isolation
   - Don't rely on test execution order

4. **Mock External Dependencies**
   - Mock API calls, WebSocket, timers
   - Keep tests fast and isolated

5. **Test User Interactions**
   - `await user.click(button)`
   - `await user.type(input, 'text')`

## Common Issues

### Test Timeout
```bash
# Increase timeout for slow tests
it('slow test', async () => {
  // ...
}, { timeout: 10000 }); // 10 seconds
```

### Component Not Found
- Ensure component is exported correctly
- Check import path is correct
- Verify test file extension matches (`.test.tsx`)

### API Calls Failing
- Mock with `vi.mock()` or MSW
- Check mock is set up before rendering component

### Async Issues
- Always `await` async operations
- Use `screen.findBy*` for async queries
- Wrap state updates in `act()`

## CI/CD Integration

Tests run automatically on:
- Every push to `develop` or `main`
- Every pull request
- Must pass before merge

View results in GitHub Actions > Workflows

## Performance Testing

Monitor test execution time:

```bash
npm run test:coverage -- --reporter=verbose
```

Target: Most tests should complete in < 100ms

## Next Steps

1. Increase coverage to 60%+ by adding tests for:
   - Error states and edge cases
   - User interactions (clicks, forms)
   - API error scenarios

2. Add performance tests for:
   - Component render time
   - API response times
   - Chart rendering performance

3. Setup visual regression testing with Percy or similar
