import { test, expect } from '@playwright/test';

// Helper to generate unique email
const uniqueEmail = () => `test-${Date.now()}@example.com`;

test.describe('MVP User Flow', () => {
  test.describe('1. Homepage', () => {
    test('should display homepage with hero section', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('h1')).toContainText('맛있는 레시피를');
      await expect(page.getByRole('link', { name: '레시피 둘러보기' })).toBeVisible();
      await expect(page.getByRole('link', { name: '시작하기' })).toBeVisible();
    });

    test('should have navigation header', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Recipe Share' })).toBeVisible();
      await expect(page.getByRole('link', { name: '레시피', exact: true })).toBeVisible();
      await expect(page.locator('header').getByRole('link', { name: '로그인' })).toBeVisible();
    });
  });

  test.describe('2. User Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
      await expect(page.getByLabel('이름')).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호', { exact: true })).toBeVisible();
      await expect(page.getByLabel('비밀번호 확인')).toBeVisible();
      await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByLabel('이름').fill('테스트 사용자');
      await page.getByLabel('이메일').fill('test@example.com');
      await page.getByLabel('비밀번호', { exact: true }).fill('password123');
      await page.getByLabel('비밀번호 확인').fill('different123');
      await page.getByRole('button', { name: '회원가입' }).click();

      await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
    });

    test('should show password hint', async ({ page }) => {
      await page.goto('/auth/register');

      // Check that password hint is visible
      await expect(page.getByText('8자 이상 입력해주세요')).toBeVisible();
    });
  });

  test.describe('3. User Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/auth/login');

      // Use the link in the main content, not the header
      const registerLink = page.locator('main').getByRole('link', { name: '회원가입' });
      await expect(registerLink).toBeVisible();
      await registerLink.click();
      await expect(page).toHaveURL('/auth/register');
    });
  });

  test.describe('4. Recipe Listing', () => {
    test('should display recipe listing page', async ({ page }) => {
      await page.goto('/recipes');

      await expect(page.getByRole('heading', { name: '레시피 목록' })).toBeVisible();
    });

    test('should show empty state when no recipes', async ({ page }) => {
      await page.goto('/recipes');

      // Either shows recipes or empty state
      const hasRecipes = await page.locator('[href^="/recipes/"]').count() > 1;
      if (!hasRecipes) {
        await expect(page.getByText('아직 레시피가 없습니다')).toBeVisible();
      }
    });

    test('should navigate from home to recipes', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: '레시피 둘러보기' }).click();
      await expect(page).toHaveURL('/recipes');
    });
  });

  test.describe('5. Recipe Creation (requires auth)', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/recipes/new');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('6. Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Recipe Share' })).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/recipes');

      await expect(page.getByRole('heading', { name: '레시피 목록' })).toBeVisible();
    });
  });
});

test.describe('Full Auth Flow', () => {
  const testUser = {
    name: '테스트 사용자',
    email: uniqueEmail(),
    password: 'testpassword123',
  };

  test('complete registration and login flow', async ({ page }) => {
    // Step 1: Navigate to registration
    await page.goto('/auth/register');

    // Step 2: Fill registration form
    await page.getByLabel('이름').fill(testUser.name);
    await page.getByLabel('이메일').fill(testUser.email);
    await page.getByLabel('비밀번호', { exact: true }).fill(testUser.password);
    await page.getByLabel('비밀번호 확인').fill(testUser.password);

    // Step 3: Submit registration
    await page.getByRole('button', { name: '회원가입' }).click();

    // Step 4: Should redirect to recipes page after successful registration
    await expect(page).toHaveURL('/recipes', { timeout: 10000 });

    // Step 5: Should show user name in header
    await expect(page.getByText(testUser.name)).toBeVisible();

    // Step 6: Logout
    await page.getByText('로그아웃').click();

    // Step 7: Should show login button again
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();

    // Step 8: Login with created account
    await page.goto('/auth/login');
    await page.getByLabel('이메일').fill(testUser.email);
    await page.getByLabel('비밀번호').fill(testUser.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // Step 9: Should redirect to recipes and show user name
    await expect(page).toHaveURL('/recipes', { timeout: 10000 });
    await expect(page.getByText(testUser.name)).toBeVisible();
  });
});
