declare module '@mchat/ui-tokens' {
  export const spacing: { md: number };
  export const typography: { fontSize: { lg: number } };
  export function useTheme(): { colors: { primary: string } };
}
