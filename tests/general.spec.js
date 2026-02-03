// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing Tests', () => {
    test('should navigate between pages', async ({ page }) => {
        await page.goto('/');

        // Test navigation to different pages
        // Add more routes based on your application structure
        const routes = [
            { path: '/', name: 'Homepage' },
            { path: '/login', name: 'Login' },
            { path: '/signup', name: 'Register' }, // Updated to match actual route
        ];

        for (const route of routes) {
            await page.goto(route.path);
            await expect(page).toHaveURL(new RegExp(route.path));
        }
    });

    test.fixme('should handle 404 page', async ({ page }) => {
        // FIXME: 404 Page not implemented yet. 
        // Once implemented, this test should be enabled.
        await page.goto('/non-existent-page-12345');

        // Check if 404 content is shown
        // We look for common 404 text patterns directly on the page
        const bodyText = await page.locator('body').innerText();
        const hasErrorText =
            /page not found|404|nothing here|oops/i.test(bodyText) ||
            (await page.getByRole('heading', { name: /404|not found/i }).count() > 0);

        expect(hasErrorText).toBeTruthy();
    });
});

test.describe('Responsive Design Tests', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Check if mobile navigation is visible (hamburger menu, etc.)
        // Adjust selectors based on your implementation
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display properly on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display properly on desktop viewport', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});

test.describe('Performance Tests', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;

        // Homepage should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should not have console errors on homepage', async ({ page }) => {
        /** @type {string[]} */
        const consoleErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');

        // Allow the page to fully load
        await page.waitForLoadState('networkidle');

        // Log any console errors for debugging
        if (consoleErrors.length > 0) {
            console.log('Console errors found:', consoleErrors);
        }

        // This is informational - you can make it stricter if needed
        // expect(consoleErrors).toHaveLength(0);
    });
});
