import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    appOwnership: 'standalone',
    executionEnvironment: 'bare',
    expoConfig: { extra: {} },
  },
}));

jest.mock('@hum/hum-matrix-native', () => ({
  __esModule: true,
  default: {
    createClient: jest.fn(async () => {
      throw new Error('native unavailable');
    }),
  },
}));

const {
  HumClientProvider,
  useHumClient,
} = require('../apps/mobile/src/hum/HumClientProvider');
jest.mock('../apps/mobile/src/hum/MockClient', () => ({
  MockClient: class {
    constructor(hs: string, store: string) {}
    async login() {}
    async logout() {}
    async isAuthenticated() {
      return false;
    }
    async getRooms() {
      return [{ id: 'r1' }];
    }
    async sendText() {}
    async sendReaction() {}
    async redact() {}
    async sendReadReceipt() {}
    async setTyping() {}
    async createRoom() {
      return 'r1';
    }
    async joinRoom(id: string) {
      return id;
    }
    async leaveRoom() {}
    async startSyncLoop() {}
    async stopSyncLoop() {}
    async syncOnce() {}
    async dispose() {}
    async importRecoveryKey() {}
    async searchUsers() {
      return [];
    }
    async getDevices() {
      return [];
    }
    async renameDevice() {}
    async deleteDevice() {}
    async uploadMedia() {
      return '';
    }
    async downloadMedia() {
      return new Uint8Array();
    }
    async setPresence() {}
    async getPresence() {
      return 0;
    }
  },
}));

describe('HumClientProvider fallback', () => {
  it('falls back to MockClient when native init fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (globalThis as any).__HUM_FORCE_MOCK__ = true;

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <HumClientProvider>{children}</HumClientProvider>
    );

    const { result } = renderHook(() => useHumClient(), { wrapper });

    await waitFor(() => result.current.ready);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    delete (globalThis as any).__HUM_FORCE_MOCK__;
  });
});
