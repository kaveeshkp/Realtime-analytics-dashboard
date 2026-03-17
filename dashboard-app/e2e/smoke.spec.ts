import { test, expect } from '@playwright/test';

test.describe('App Smoke Tests', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/');

    // Should render the main shell
    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });

  test('displays DASHFLOW logo', async ({ page }) => {
    await page.goto('/');

    const logo = page.getByText('DASHFLOW');
    await expect(logo).toBeVisible();
  });

  test('renders navigation items', async ({ page }) => {
    await page.goto('/');

    const navContainer = page.locator('nav');
    await expect(navContainer).toBeVisible();
  });

  test('theme toggle button is visible', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.getByTitle(/Toggle theme|Switch to/);
    await expect(themeButton).toBeVisible();
  });

  test('page does not have critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Allow some time for potential errors to appear
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // There should be no critical errors (filter out known issues if any)
    const criticalErrors = errors.filter(
      err => !err.includes('setLexicalConversion') // Known benign issue
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('responds to viewport changes', async ({ page }) => {
    await page.goto('/');

    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    let navVisible = await page.locator('nav').isVisible();
    expect(navVisible).toBe(true);

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    navVisible = await page.locator('nav').isVisible();
    expect(navVisible).toBe(true);
  });
});
