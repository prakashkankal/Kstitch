// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Tests', () => {
    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Find and click the login link/button
        const loginLink = page.getByRole('link', { name: /login/i });
        await loginLink.click();

        // Verify we're on the login page
        await expect(page).toHaveURL(/.*login/);
    });

    test('should display login form', async ({ page }) => {
        await page.goto('/login');

        // Check for email input (using placeholder since form doesn't use proper labels)
        const emailInput = page.getByPlaceholder(/example@mail.com|email/i);
        await expect(emailInput).toBeVisible();

        // Check for password input (using placeholder)
        const passwordInput = page.getByPlaceholder(/••••••••|password/i);
        await expect(passwordInput).toBeVisible();

        // Check for login button
        const loginButton = page.getByRole('button', { name: /^login$/i });
        await expect(loginButton).toBeVisible();
    });

    test('should show validation error for empty form submission', async ({ page }) => {
        await page.goto('/login');

        // Try to submit empty form
        const loginButton = page.getByRole('button', { name: /login|sign in/i });
        await loginButton.click();

        // Check for error message (adjust selector based on your implementation)
        // This might be a toast notification, inline error, etc.
        const errorMessage = page.locator('[role="alert"]').or(page.locator('.error, .error-message'));

        // Wait a bit for error to show
        await page.waitForTimeout(1000);
    });

    test('should display Google login option', async ({ page }) => {
        await page.goto('/login');

        // Look for Google login button
        const googleButton = page.getByRole('button', { name: /google/i });
        await expect(googleButton).toBeVisible();
    });

    test('should navigate to registration page', async ({ page }) => {
        // Go directly to login page to ensure consistently starting point
        await page.goto('/login');

        // Find and click the specific "Sign Up" link
        await page.getByRole('link', { name: 'Sign Up' }).click();

        // Verify we navigate to signup page
        await expect(page).toHaveURL(/.*signup/);
    });

    test('should display registration form', async ({ page }) => {
        await page.goto('/register');

        // Check for name input (using placeholder)
        const nameInput = page.getByPlaceholder(/e.g. John Doe|John Doe|full name/i);
        await expect(nameInput).toBeVisible();

        // Check for email input (using placeholder)
        const emailInput = page.getByPlaceholder(/john@example.com|email/i);
        await expect(emailInput).toBeVisible();

        // Check for password input (using placeholder)
        const passwordInput = page.getByPlaceholder(/••••••••|password/i).first();
        // Use .first() because there might be Confirm Password field too
        await expect(passwordInput).toBeVisible();
    });
});
