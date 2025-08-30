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

  const indexResp = await page.request.get('/index.json');
  const indexJson = await indexResp.json();
  const entries: Record<string, { type?: string }> = indexJson.entries;
  const firstStoryId = Object.keys(entries).find(
    (id) => entries[id].type === 'story',
  );

  await page.goto(`/?path=/story/${firstStoryId}`);
  await expect(page.locator('#storybook-explorer-menu')).toBeVisible();

  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('#storybook-root')).toBeVisible({
    timeout: 30_000,
  });

  expect(consoleErrors, 'console errors').toEqual([]);
  expect(pageErrors, 'page errors').toEqual([]);
  expect(failedRequests, 'failed requests').toEqual([]);
});
