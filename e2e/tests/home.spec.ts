import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('맛있는 레시피를');
    await expect(page.getByText('Recipe Share에서 전 세계의 맛있는 레시피를')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    const recipesLink = page.getByRole('link', { name: '레시피 둘러보기' });
    const registerLink = page.getByRole('link', { name: '시작하기' });

    await expect(recipesLink).toBeVisible();
    await expect(registerLink).toBeVisible();
    await expect(recipesLink).toHaveAttribute('href', '/recipes');
    await expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  test('should display feature cards as clickable links', async ({ page }) => {
    const writeRecipeCard = page.getByRole('link', { name: /쉬운 레시피 작성/ });
    const searchCard = page.getByRole('link', { name: /스마트 검색/ });
    const likeCard = page.getByRole('link', { name: /좋아요 & 저장/ });

    await expect(writeRecipeCard).toBeVisible();
    await expect(searchCard).toBeVisible();
    await expect(likeCard).toBeVisible();

    await expect(writeRecipeCard).toHaveAttribute('href', '/recipes/new');
    await expect(searchCard).toHaveAttribute('href', '/recipes');
    await expect(likeCard).toHaveAttribute('href', '/auth/login');
  });

  test('should navigate to new recipe page from feature card (redirects to login)', async ({ page }) => {
    await page.getByRole('link', { name: /쉬운 레시피 작성/ }).click();
    // Redirects to login when not authenticated
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should navigate to recipes page', async ({ page }) => {
    await page.getByRole('link', { name: '레시피 둘러보기' }).click();
    await expect(page).toHaveURL('/recipes');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: '시작하기' }).click();
    await expect(page).toHaveURL('/auth/register');
  });
});
