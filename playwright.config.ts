import { defineConfig } from '@playwright/test';

const PORT = 6006;
const isStatic = !!process.env.SB_STATIC;

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: isStatic
    ? {
        command: `npx http-server apps/storybook/storybook-static -p ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
      }
    : {
        command: 'npm run storybook:dev',
        port: PORT,
        reuseExistingServer: !process.env.CI,
      },
});
