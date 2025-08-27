import { accessibleLabel, hitSlop } from '.';

describe('accessibleLabel', () => {
  test('returns text when extras are not provided', () => {
    expect(accessibleLabel('Submit')).toBe('Submit');
  });

  test('combines text with a single extra string', () => {
    expect(accessibleLabel('Submit', 'button')).toBe('Submit, button');
  });

  test('combines text with multiple extras and filters falsy', () => {
    const result = accessibleLabel('Submit', ['primary', '', 'form']);
    expect(result).toBe('Submit, primary, form');
  });

  test('returns text when all extras are falsy', () => {
    // extras array with empty strings should be ignored
    expect(accessibleLabel('Submit', ['', ''])).toBe('Submit');
    // single empty string extra
    expect(accessibleLabel('Submit', '')).toBe('Submit');
  });
});

describe('hitSlop', () => {
  test('creates uniform hit slop when given a number', () => {
    expect(hitSlop(8)).toEqual({ top: 8, bottom: 8, left: 8, right: 8 });
  });

  test('fills in missing values with 0 when given an object', () => {
    expect(hitSlop({ top: 4, left: 2 })).toEqual({
      top: 4,
      bottom: 0,
      left: 2,
      right: 0,
    });
  });

  test('preserves provided zero values', () => {
    expect(hitSlop({ top: 0, right: 3 })).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 3,
    });
  });
});
