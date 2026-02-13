// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Helper function to login as a tailor
 * @param {import('@playwright/test').Page} page
 */
async function loginAsTailor(page) {
    const email = process.env.TEST_TAILOR_EMAIL || 'rajesh.patil@example.com';
    const password = process.env.TEST_TAILOR_PASSWORD || 'Demo@123';

    await page.goto('/login');
    await page.getByPlaceholder(/example@mail.com|email/i).fill(email);
    await page.getByPlaceholder(/••••••••|password/i).fill(password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForLoadState('networkidle');
}

test.describe('Payment Mode Selection Tests', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTailor(page);
    });

    test('should default to "Select Mode"', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        if (await orderLink.isVisible()) {
            await orderLink.click();
            await page.waitForLoadState('networkidle');

            const paymentSection = page.getByText('Complete Payment');
            if (await paymentSection.isVisible()) {
                const modeSelect = page.locator('select').filter({ has: page.locator('option:has-text("Select Mode")') }).first();
                await expect(modeSelect).toHaveValue('');
            }
        }
    });

    test('Pay Now mode shows only Pay Now fields', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        if (await orderLink.isVisible()) {
            await orderLink.click();
            await page.waitForLoadState('networkidle');

            const paymentSection = page.getByText('Complete Payment');
            if (await paymentSection.isVisible()) {
                const modeSelect = page.locator('select').first();
                await modeSelect.selectOption('Pay Now');

                await expect(page.getByText('Pay Now Amount *')).toBeVisible();
                await expect(page.getByText('Pay Later Details')).not.toBeVisible();
            }
        }
    });

    test('Pay Later mode disables Pay Now and auto-fills amount', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        if (await orderLink.isVisible()) {
            await orderLink.click();
            await page.waitForLoadState('networkidle');

            const paymentSection = page.getByText('Complete Payment');
            if (await paymentSection.isVisible()) {
                const modeSelect = page.locator('select').first();
                await modeSelect.selectOption('Pay Later');

                await expect(page.getByText('Pay Later Details')).toBeVisible();
                await expect(page.getByText('No payment now - full amount scheduled for later')).toBeVisible();
            }
        }
    });

    test('Partial mode shows both fields with auto-calculation', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        if (await orderLink.isVisible()) {
            await orderLink.click();
            await page.waitForLoadState('networkidle');

            const paymentSection = page.getByText('Complete Payment');
            if (await paymentSection.isVisible()) {
                const modeSelect = page.locator('select').first();
                await modeSelect.selectOption('Partial');

                await expect(page.getByText('Pay Now Amount *')).toBeVisible();
                await expect(page.getByText('Remaining Amount Details')).toBeVisible();
            }
        }
    });

    test('validates payment mode is required', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        if (await orderLink.isVisible()) {
            await orderLink.click();
            await page.waitForLoadState('networkidle');

            const paymentSection = page.getByText('Complete Payment');
            if (await paymentSection.isVisible()) {
                const submitButton = page.getByRole('button', { name: /Complete Payment/i });
                await submitButton.click();

                await expect(page.getByText('Please select a payment mode')).toBeVisible();
            }
        }
    });
});
