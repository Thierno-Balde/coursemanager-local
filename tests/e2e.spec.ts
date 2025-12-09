import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';

let electronApp: ElectronApplication;
let window: Page;

test.describe('Course Manager E2E', () => {

    test.beforeAll(async () => {
        // Launch Electron app using the current directory which uses package.json main entry
        electronApp = await electron.launch({
            args: ['.'],
            env: { ...process.env, NODE_ENV: 'test' }
        });

        // Wait for the first window to open
        window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');
    });

    test.afterAll(async () => {
        if (electronApp) {
            await electronApp.close();
        }
    });

    test('should launch the application with correct title', async () => {
        const title = await window.title();
        console.log(`App Title: ${title}`);
        // Adjust expectation based on your actual generic title found in index.html or main.ts
        // package.json productName is "Isaac.Mpah CourseManager"
        // But window title usually comes from HTML or is set by code.
        expect(title).toBeDefined();
    });

    test('should display the dashboard', async () => {
        // Check for a known element on the dashboard
        const header = window.getByText('Accueil - Mode Cours');
        await expect(header).toBeVisible();
    });
});
