import { test, expect } from '@playwright/test';

test.describe('Recipes Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes');
  });

  test('should display recipes page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /레시피/i })).toBeVisible();
  });

  test('should be accessible from home page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '레시피 둘러보기' }).click();
    await expect(page).toHaveURL('/recipes');
  });
});

test.describe('Accessibility', () => {
  test('home page should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('login page should have proper form labels', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.getByLabel('이메일');
    const passwordInput = page.getByLabel('비밀번호');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: '레시피 둘러보기' })).toBeVisible();
  });

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('쉬운 레시피 작성')).toBeVisible();
  });

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Recipe Share의 특별한 기능')).toBeVisible();
  });
});
