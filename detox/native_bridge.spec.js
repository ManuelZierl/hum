/* global device, element, by, expect */

describe('Dev Native Bridge Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('opens dev screen and calls native methods', async () => {
    await expect(element(by.id('btnOpenDev'))).toBeVisible();
    await element(by.id('btnOpenDev')).tap();

    await element(by.id('btnCreate')).tap();
    await expect(element(by.id('statusText'))).toHaveText('created');

    await element(by.id('btnIsAuth')).tap();
    await expect(element(by.id('isAuthValue'))).toBeVisible();

    await element(by.id('btnGetRooms')).tap();
    await expect(element(by.id('statusText'))).toHaveText('getRooms-ok');
  });
});
