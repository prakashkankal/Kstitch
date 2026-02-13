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

test.describe('Swipe-to-Remove Order from Recent Tab', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTailor(page);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('should show trash icon/action background during swipe (mobile)', async ({ page, context }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Reload to trigger mobile layout
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Find first order card
        const firstOrder = page.locator('[role="listitem"]').first();

        if (await firstOrder.isVisible()) {
            // Get the order card bounds
            const box = await firstOrder.boundingBox();
            if (box) {
                // Swipe right partially (not enough to remove)
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 100, box.y + box.height / 2);

                // Check if background/trash icon is visible during drag
                // The red background should be visible
                const background = page.locator('.bg-linear-to-r.from-red-500');
                await expect(background.first()).toBeVisible();

                // Release to snap back
                await page.mouse.up();
            }
        }
    });

    test('drag below threshold should return card to position, not remove', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Count initial orders
        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const orderText = await firstOrder.textContent();
            const box = await firstOrder.boundingBox();

            if (box) {
                // Swipe right but less than threshold (40% = ~150px on 375px width)
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 80, box.y + box.height / 2); // Only 70px
                await page.mouse.up();

                // Wait for animation
                await page.waitForTimeout(500);

                // Order should still be there
                const afterCount = await page.locator('[role="listitem"]').count();
                expect(afterCount).toBe(initialCount);

                // Original order should still be visible
                await expect(page.locator(`text=${orderText}`).first()).toBeVisible();
            }
        }
    });

    test('drag above threshold should remove from Recent UI', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const customerName = await firstOrder.locator('p.font-bold').first().textContent();
            const box = await firstOrder.boundingBox();

            if (box && customerName) {
                // Swipe right beyond threshold (40% = ~150px)
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2); // Beyond threshold
                await page.mouse.up();

                // Wait for remove animation
                await page.waitForTimeout(500);

                // Order count should decrease
                const afterCount = await page.locator('[role="listitem"]').count();
                expect(afterCount).toBe(initialCount - 1);

                // Undo toast should appear
                await expect(page.getByText(/Removed.*from Recent/i)).toBeVisible();
            }
        }
    });

    test('undo should restore removed item', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const customerName = await firstOrder.locator('p.font-bold').first().textContent();
            const box = await firstOrder.boundingBox();

            if (box && customerName) {
                // Remove order
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(500);

                // Click undo
                const undoButton = page.getByRole('button', { name: /UNDO/i });
                await expect(undoButton).toBeVisible();
                await undoButton.click();

                // Wait a bit
                await page.waitForTimeout(300);

                // Order should be restored
                const restoredCount = await page.locator('[role="listitem"]').count();
                expect(restoredCount).toBe(initialCount);

                // Original order should be visible again
                await expect(page.locator(`text=${customerName}`).first()).toBeVisible();
            }
        }
    });

    test('keyboard Delete key should remove from Recent', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();

            // Focus the order card
            await firstOrder.focus();

            // Press Delete key
            await page.keyboard.press('Delete');

            // Wait for animation
            await page.waitForTimeout(500);

            // Order should be removed
            const afterCount = await page.locator('[role="listitem"]').count();
            expect(afterCount).toBe(initialCount - 1);

            // Undo toast should appear
            await expect(page.getByText(/Removed.*from Recent/i)).toBeVisible();
        }
    });

    test('localStorage should persist hidden items after reload', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const customerName = await firstOrder.locator('p.font-bold').first().textContent();
            const box = await firstOrder.boundingBox();

            if (box && customerName) {
                // Remove order
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(500);

                const afterRemove = await page.locator('[role="listitem"]').count();

                // Reload page
                await page.reload();
                await page.waitForLoadState('networkidle');

                // Order should still be hidden
                const afterReload = await page.locator('[role="listitem"]').count();
                expect(afterReload).toBe(afterRemove);

                // Removed order should not be visible
                const removedOrder = page.locator(`text=${customerName}`);
                await expect(removedOrder).toHaveCount(0);
            }
        }
    });

    test('no API deletion call should be made (only UI removal)', async ({ page }) => {
        // Monitor network requests
        const deleteRequests = [];
        page.on('request', request => {
            if (request.method() === 'DELETE' && request.url().includes('/api/orders')) {
                deleteRequests.push(request.url());
            }
        });

        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const box = await firstOrder.boundingBox();

            if (box) {
                // Remove order
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(1000);

                // No DELETE requests should have been made to orders endpoint
                expect(deleteRequests.length).toBe(0);
            }
        }
    });

    test('removed orders coexist with payment-due filtering', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Look for orders with payment due badges
        const paymentDueOrders = page.locator('[role="listitem"]').filter({
            has: page.locator('text=/Payment Due|Partial Payment|Payment Scheduled/i')
        });

        const paymentDueCount = await paymentDueOrders.count();

        if (paymentDueCount > 0) {
            // Even orders with payment due can be swiped away
            const firstPaymentDue = paymentDueOrders.first();
            const box = await firstPaymentDue.boundingBox();

            if (box) {
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(500);

                // Order should be removed from UI
                const afterCount = await paymentDueOrders.count();
                expect(afterCount).toBe(paymentDueCount - 1);
            }
        }
    });
});

test.describe('Swipe-to-Remove Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTailor(page);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('undo toast should auto-dismiss after 5 seconds', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            const firstOrder = page.locator('[role="listitem"]').first();
            const box = await firstOrder.boundingBox();

            if (box) {
                // Remove order
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(500);

                // Undo toast should be visible
                const undoButton = page.getByRole('button', { name: /UNDO/i });
                await expect(undoButton).toBeVisible();

                // Wait 5+ seconds
                await page.waitForTimeout(5500);

                // Undotoast should be hidden
                await expect(undoButton).toBeHidden();
            }
        }
    });

    test('multiple rapid swipes should work correctly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Wait for orders to render
        await page.locator('[role="listitem"]').first().waitFor({ state: 'visible', timeout: 10000 });

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount >= 2) {
            // Remove first order
            let order = page.locator('[role="listitem"]').first();
            let box = await order.boundingBox();
            if (box) {
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();
                // Wait for animation and removal
                await page.waitForTimeout(1000);
            }

            // Re-query list items
            const currentCount = await page.locator('[role="listitem"]').count();
            expect(currentCount).toBe(initialCount - 1);

            // Remove the new first order
            order = page.locator('[role="listitem"]').first();
            box = await order.boundingBox();
            if (box) {
                await page.mouse.move(box.x + 10, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + box.height / 2);
                await page.mouse.up();
                // Wait for animation and removal
                await page.waitForTimeout(1000);
            }

            // Should have removed 2 orders total
            const finalCount = await page.locator('[role="listitem"]').count();
            expect(finalCount).toBe(initialCount - 2);
        }
    });

    test('should support "Remove from Recent" via menu action (accessibility fallback)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Wait for orders
        await page.locator('[role="listitem"]').first().waitFor({ state: 'visible', timeout: 10000 });

        const initialCount = await page.locator('[role="listitem"]').count();

        if (initialCount > 0) {
            // Find the action menu button of the FIRST available order
            // Note: We need to target the button specifically within the list item
            const firstOrder = page.locator('[role="listitem"]').first();
            const actionButton = firstOrder.locator('button[aria-label="Order actions"]');

            // Ensure button is visible and stable
            await actionButton.waitFor({ state: 'visible' });

            // Scroll into view if needed
            await actionButton.scrollIntoViewIfNeeded();

            // Click to open menu
            await actionButton.click();

            // Wait for menu to appear (it's absolute positioned)
            // The menu contains "Remove from Recent" button
            const removeButton = page.getByRole('button', { name: /Remove from Recent/i }).first();
            await removeButton.waitFor({ state: 'visible', timeout: 5000 });

            // Click remove
            await removeButton.click();

            // Wait for removal animation/update
            await page.waitForTimeout(1000);

            // Verify removal
            const afterCount = await page.locator('[role="listitem"]').count();
            expect(afterCount).toBe(initialCount - 1);

            // Verify undo toast appears
            await expect(page.getByText(/Removed.*from Recent/i)).toBeVisible();
        }
    });
});
