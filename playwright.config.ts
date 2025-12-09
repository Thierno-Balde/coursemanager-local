import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    fullyParallel: false, // Electron tests often can't run in parallel on the same app instance easily
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
    },
    workers: 1, // Run sequentially for Electron
});
