import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should display login form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('should have link to register page', async ({ page }) => {
      const registerLink = page.locator('main').getByRole('link', { name: '회원가입' });
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute('href', '/auth/register');
    });

    test('should allow typing in email field', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    });

    test('should allow typing in password field', async ({ page }) => {
      const passwordInput = page.getByLabel('비밀번호');
      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123');
    });

    test('should navigate to register page', async ({ page }) => {
      await page.locator('main').getByRole('link', { name: '회원가입' }).click();
      await expect(page).toHaveURL('/auth/register');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
    });

    test('should display register form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
      await expect(page.getByLabel('이름')).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호', { exact: true })).toBeVisible();
      await expect(page.getByLabel('비밀번호 확인')).toBeVisible();
      await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('main').getByRole('link', { name: '로그인' });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/auth/login');
    });

    test('should allow filling registration form', async ({ page }) => {
      await page.getByLabel('이름').fill('테스트 사용자');
      await page.getByLabel('이메일').fill('test@example.com');
      await page.getByLabel('비밀번호', { exact: true }).fill('password123');
      await page.getByLabel('비밀번호 확인').fill('password123');

      await expect(page.getByLabel('이름')).toHaveValue('테스트 사용자');
      await expect(page.getByLabel('이메일')).toHaveValue('test@example.com');
      await expect(page.getByLabel('비밀번호', { exact: true })).toHaveValue('password123');
      await expect(page.getByLabel('비밀번호 확인')).toHaveValue('password123');
    });
  });
});
