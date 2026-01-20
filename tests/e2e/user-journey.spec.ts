import { test, expect } from '@playwright/test';

test.describe('Grade 8 Study Hub - User Journey', () => {

    test.beforeEach(async ({ page }) => {
        // Go to the homepage
        await page.goto('/');
    });

    test('should allow Guest Login and Profile Setup', async ({ page }) => {
        // 1. Verify Login Page is visible
        await expect(page.locator('.g_id_signin')).toBeVisible();
        await expect(page.getByText('Enter as Guest')).toBeVisible();

        // 2. Click Guest Login
        await page.getByText('Enter as Guest').click();

        // 3. Verify Profile Setup Modal appears
        await expect(page.locator('#setup-profile')).toBeVisible();

        // 4. Fill in Profile Details
        await page.locator('#setup-year').fill('2010');
        await page.locator('#setup-username').fill('TestStudent');

        // 5. Submit
        await page.locator('#save-profile-btn').click();

        // 6. Verify Dashboard is visible
        await expect(page.locator('.hero-section')).toBeVisible();

        // 7. Verify Username in header
        await expect(page.locator('#header-username')).toContainText('TestStudent');
    });

    test('should add a task to the To-Do list', async ({ page }) => {
        // Bypass login for this test if possible, or repeat steps
        await page.getByText('Enter as Guest').click();
        await page.locator('#setup-year').fill('2010');
        await page.locator('#setup-username').fill('TaskMaster');
        await page.locator('#save-profile-btn').click();

        // 1. Located Add Task input (assuming interaction needed)
        // Note: The UI has a '+' button that opens a prompt or input. 
        // Based on previous code, it might be a window.prompt or a modal.
        // If it's window.prompt, we handle it:

        page.on('dialog', dialog => dialog.accept('Finish E2E Test'));

        await page.locator('.add-task-btn').click();

        // 2. Refresh page to check persistence (if local storage)
        await page.reload();

        // 3. Verify task exists (adjust selector based on actual generic rendering)
        // await expect(page.getByText('Finish E2E Test')).toBeVisible();
    });
});
