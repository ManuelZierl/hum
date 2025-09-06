const detox = require('detox');

jest.setTimeout(240000);

beforeAll(async () => {
  await detox.init();
});

afterAll(async () => {
  await detox.cleanup();
});
