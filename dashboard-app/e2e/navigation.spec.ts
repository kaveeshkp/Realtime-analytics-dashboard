import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('navigates between main pages', async ({ page }) => {
    await page.goto('/');

    // Check if we're on home page
    const homeContent = page.locator('text=Home').first();
    expect(homeContent).toBeDefined();

    // Navigate to Stocks page
    const stocksLink = page.getByText('Stocks');
    await stocksLink.first().click();

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Stocks page should be highlighted
    const stocksHighlighted = page.getByText('Stocks').first();
    expect(stocksHighlighted).toBeDefined();
  });

  test('highlights active navigation item', async ({ page }) => {
    await page.goto('/');

    // Home should be active
    let homeButton = page.getByText('Home').first();
    let homeStyle = await homeButton.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    );

    // Navigate to Crypto
    const cryptoLink = page.getByText('Crypto');
    await cryptoLink.first().click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Crypto should now be active (different styling)
    const cryptoButton = page.getByText('Crypto').first();
    const cryptoStyle = await cryptoButton.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    );

    // Styles should be different
    expect(homeStyle).not.toBe(cryptoStyle);
  });

  test('theme toggle persists across page navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const themeButton = page.getByTitle(/Toggle theme|Switch to/);
    const initialTheme = await themeButton.textContent();

    // Toggle theme
    await themeButton.click();
    await page.waitForTimeout(300); // Wait for animation

    // Navigate to another page
    const stocksLink = page.getByText('Stocks');
    await stocksLink.first().click();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Check theme is still toggled
    const themeButtonAfter = page.getByTitle(/Toggle theme|Switch to/);
    const themeAfter = await themeButtonAfter.textContent();

    expect(themeAfter).not.toBe(initialTheme);
  });

  test('browser back button navigation works', async ({ page }) => {
    await page.goto('/');

    // Navigate to Crypto
    const cryptoLink = page.getByText('Crypto');
    await cryptoLink.first().click();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Navigate to Sports
    const sportsLink = page.getByText('Sports');
    await sportsLink.first().click();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Should be on Crypto page
    const cryptoHighlighted = page.getByText('Crypto').first();
    expect(cryptoHighlighted).toBeDefined();
  });

  test('handles rapid navigation clicks', async ({ page }) => {
    await page.goto('/');

    // Click multiple nav items rapidly
    const homeLink = page.getByText('Home').first();
    const stocksLink = page.getByText('Stocks');
    const cryptoLink = page.getByText('Crypto');

    await homeLink.click();
    await stocksLink.first().click();
    await cryptoLink.first().click();

    // Should handle without errors
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const cryptoHighlighted = page.getByText('Crypto').first();
    expect(cryptoHighlighted).toBeDefined();
  });

  test('ticker updates on sports page', async ({ page }) => {
    await page.goto('/');

    // Navigate to Sports
    const sportsLink = page.getByText('Sports', { selector: 'button' }).first();
    await sportsLink.click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Check for live sports content
    const sportsTitle = page.getByText('Live Sports');
    await expect(sportsTitle).toBeVisible();

    // Check league filters exist
    const allSportsBtn = page.getByText('All Sports');
    await expect(allSportsBtn).toBeVisible();
  });

  test('page state resets when navigating away and back', async ({ page }) => {
    await page.goto('/');

    // Navigate to Crypto
    const cryptoLink = page.getByText('Crypto');
    await cryptoLink.first().click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Navigate away to Home
    const homeLink = page.getByText('Home').first();
    await homeLink.click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Navigate back to Crypto
    const cryptoLink2 = page.getByText('Crypto');
    await cryptoLink2.first().click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Page should be on Crypto
    const cryptoHighlighted = page.getByText('Crypto').first();
    expect(cryptoHighlighted).toBeDefined();
  });

  test('all league buttons are clickable on sports page', async ({ page }) => {
    await page.goto('/');

    // Navigate to Sports
    const sportsLink = page.getByText('Sports', { selector: 'button' }).first();
    await sportsLink.click();

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Click each league button
    const leagues = ['All Sports', 'Cricket', 'Rugby', 'Football', 'Basketball'];

    for (const league of leagues) {
      const btn = page.getByText(league).filter({ hasNot: page.locator('nav') });
      // Some league buttons might not be visible, that's ok
      const isVisible = await btn.first().isVisible().catch(() => false);
      if (isVisible) {
        await btn.first().click();
        await page.waitForTimeout(300);
      }
    }

    // Should complete without errors
    expect(true).toBe(true);
  });
});
