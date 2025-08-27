/* eslint-disable @typescript-eslint/no-explicit-any */
import LightningBolt from './LightningBolt';

jest.mock('react-native', () => ({
  Text: 'Text',
  StyleSheet: { create: (styles: any) => styles },
}));

jest.mock(
  '@mchat/ui-tokens',
  () => ({
    spacing: { md: 4 },
    typography: { fontSize: { lg: 18 } },
    useTheme: () => ({ colors: { primary: 'blue' } }),
  }),
  { virtual: true },
);

describe('LightningBolt', () => {
  it('renders default label with theme color', () => {
    const element = (LightningBolt as any)({});
    expect(element.props.children).toEqual(['⚡ ', 'Lightning']);
    expect(element.props.style).toEqual([
      { fontSize: 18, margin: 4, fontWeight: 'bold' },
      { color: 'blue' },
    ]);
  });

  it('renders provided label', () => {
    const element = (LightningBolt as any)({ label: 'Zap' });
    expect(element.props.children).toEqual(['⚡ ', 'Zap']);
  });
});
