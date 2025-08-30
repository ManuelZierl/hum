import { test, expect } from '@playwright/test';

test('storybook loads without runtime errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err);
  });

  const failedRequests: string[] = [];
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} - ${req.failure()?.errorText}`);
  });

  await page.goto('/');
  await expect(page.locator('#storybook-explorer-menu')).toBeVisible();

  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('#root')).toBeVisible();

  expect(consoleErrors, 'console errors').toEqual([]);
  expect(pageErrors, 'page errors').toEqual([]);
  expect(failedRequests, 'failed requests').toEqual([]);
});
