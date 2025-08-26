export function accessibleLabel(
  text: string,
  extras?: string | string[],
): string {
  if (!extras) {
    return text;
  }
  const parts = Array.isArray(extras) ? extras : [extras];
  const extra = parts.filter(Boolean).join(', ');
  return extra ? `${text}, ${extra}` : text;
}

export interface HitSlop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function hitSlop(area: number | Partial<HitSlop>): HitSlop {
  if (typeof area === 'number') {
    return { top: area, bottom: area, left: area, right: area };
  }
  return {
    top: area.top ?? 0,
    bottom: area.bottom ?? 0,
    left: area.left ?? 0,
    right: area.right ?? 0,
  };
}
