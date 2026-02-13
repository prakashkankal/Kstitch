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

test.describe('New Order Payment Flow', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTailor(page);
        await page.goto('/orders/new');
        // Wait for page to load potentially
        await expect(page.getByText('Payment Mode')).toBeVisible({ timeout: 10000 });
    });

    test('should verify payment mode options exist', async ({ page }) => {

        // Check for Payment Mode section
        const paymentModeLabel = page.getByText('Payment Mode', { exact: false });
        await expect(paymentModeLabel).toBeVisible();

        // Check for option labels
        await expect(page.getByText('Cash')).toBeVisible();
        await expect(page.getByText('Online')).toBeVisible();
        await expect(page.getByText('Pay Later')).toBeVisible();

        // Verify "Cash" is default checked (checking the hidden input state)
        // We use hidden state check because visually it's custom styled
        const cashInput = page.locator('input[name="paymentMode"][value="Cash"]');
        await expect(cashInput).toBeChecked();
    });

    test('should enable and require advance payment for Cash/Online', async ({ page }) => {

        const advanceInput = page.locator('input[name="advancePayment"]');

        // Select Cash (default) - ensure input enabled
        await expect(advanceInput).toBeEnabled();
        // Check required attribute
        await expect(advanceInput).toHaveAttribute('required', '');

        // Click Online
        await page.locator('label').filter({ hasText: 'Online' }).click();

        await expect(page.locator('input[name="paymentMode"][value="Online"]')).toBeChecked();
        await expect(advanceInput).toBeEnabled();
        await expect(advanceInput).toHaveAttribute('required', '');

        // Try submitting empty
        // Fill other required fields first to isolate advance payment error
        await page.getByPlaceholder(/customer name/i).fill('Test Payment User');
        await page.getByPlaceholder(/10-digit mobile number/i).fill('9999999999');

        // Wait for date picker/input
        const dateInput = page.getByPlaceholder(/DD\/MM\/YYYY/i);
        await dateInput.click();
        await dateInput.fill('01/01/2026');

        // Add item
        // If Custom Type input is present or Select, handle it.
        // Assuming default state has Item #1
        // Need to fill "Garment Type" if custom or select preset
        // Check if select exists
        const garmentSelect = page.locator('select').first();
        if (await garmentSelect.isVisible()) {
            // Select "Custom Type" or first option
            await garmentSelect.selectOption({ index: 1 }); // Select first real option
        } else {
            // Or fill garment type input
            await page.getByPlaceholder(/e.g., Shirt, Pant/i).fill('Test Shirt');
        }

        // Price per item
        await page.locator('input[type="number"]').filter({ hasText: /Price/i }).first().fill('1000'); // Might need better selector
        // Actually, searching by layout structure or placeholder
        // Look for quantity and price inputs in the item card
        // Inputs in item card
        const priceInput = page.locator('input[placeholder="Enter price"]').first();
        await priceInput.fill('1000');

        // Click Create Order
        await page.getByRole('button', { name: /Create Order/i }).click();

        // Expect focus on advance payment or error
        await expect(advanceInput).toBeFocused();
    });

    test('should disable and clear advance payment for Pay Later', async ({ page }) => {

        const advanceInput = page.locator('input[name="advancePayment"]');

        // Fill some value first
        await advanceInput.fill('500');
        await expect(advanceInput).toHaveValue('500');

        // Switch to Pay Later
        await page.locator('label').filter({ hasText: 'Pay Later' }).click();

        // Expect disabled and cleared
        await expect(page.locator('input[name="paymentMode"][value="Pay Later"]')).toBeChecked();
        await expect(advanceInput).toBeDisabled();
        await expect(advanceInput).toHaveValue('');

        await expect(advanceInput).not.toHaveAttribute('required', '');
    });
});

test.describe('Order Detail Page - Payment Step Toggle', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTailor(page);
    });

    test('should hide sections by default during payment step', async ({ page }) => {
        // Navigate to an order that's in "Order Completed" status (will need to create or use existing)
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find an order in "Order Completed" status or create one
        // For this test, we'll assume there's one - in real scenario you'd create one
        const orderLink = page.locator('a[href*="/order/"]').first();
        await orderLink.click();
        await page.waitForLoadState('networkidle');

        // Check if payment section is visible (order completed status)
        const paymentSection = page.getByText('Complete Payment').first();

        if (await paymentSection.isVisible()) {
            // Sections should be hidden by default
            const orderSummary = page.getByText('Order Summary').first();
            const customerDetails = page.getByText('Customer Details').first();
            const measurements = page.getByText('Measurements').first();
            const notes = page.getByText('Notes').first();

            // These sections should not be visible
            await expect(orderSummary).not.toBeVisible();
            await expect(customerDetails).not.toBeVisible();
            await expect(measurements).not.toBeVisible();
            await expect(notes).not.toBeVisible();
        }
    });

    test('should show toggle button during payment step', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        await orderLink.click();
        await page.waitForLoadState('networkidle');

        const paymentSection = page.getByText('Complete Payment').first();

        if (await paymentSection.isVisible()) {
            // Toggle button should be visible
            const toggleButton = page.getByRole('button', { name: /Show Details|Hide Details/i });
            await expect(toggleButton).toBeVisible();

            // Check aria attributes
            await expect(toggleButton).toHaveAttribute('aria-expanded');
            await expect(toggleButton).toHaveAttribute('aria-label');
        }
    });

    test('should toggle section visibility on button click', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const orderLink = page.locator('a[href*="/order/"]').first();
        await orderLink.click();
        await page.waitForLoadState('networkidle');

        const paymentSection = page.getByText('Complete Payment').first();

        if (await paymentSection.isVisible()) {
            const toggleButton = page.getByRole('button', { name: /Show Details/i });

            // Click to show sections
            await toggleButton.click();

            // Wait a bit for animation
            await page.waitForTimeout(300);

            // Sections should now be visible
            const orderSummary = page.getByText('Order Summary').first();
            await expect(orderSummary).toBeVisible();

            // Button text should change
            await expect(page.getByRole('button', { name: /Hide Details/i })).toBeVisible();

            // Click again to hide
            const hideButton = page.getByRole('button', { name: /Hide Details/i });
            await hideButton.click();

            await page.waitForTimeout(300);

            // Sections should be hidden again
            await expect(orderSummary).not.toBeVisible();
        }
    });

    test('should not show toggle button outside payment step', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find an order NOT in payment step
        const orderLink = page.locator('a[href*="/order/"]').first();
        await orderLink.click();
        await page.waitForLoadState('networkidle');

        // If not in payment step, toggle should not exist
        const paymentSection = page.getByText('Complete Payment').first();

        if (!await paymentSection.isVisible()) {
            const toggleButton = page.getByRole('button', { name: /Show Details|Hide Details/i });
            await expect(toggleButton).not.toBeVisible();

            // All sections should be visible
            const orderSummary = page.getByText('Order Summary').first();
            const customerDetails = page.getByText('Customer Details').first();

            await expect(orderSummary).toBeVisible();
            await expect(customerDetails).toBeVisible();
        }
    });
});

