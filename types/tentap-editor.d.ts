declare module '@10play/tentap-editor' {
  import type React from 'react';

  export interface EditorBridge {
    getHTML(): Promise<string>;
    getText(): Promise<string>;
    setPlaceholder(value: string): void;
    setContent(value: string): void;
    focus(): void;
    setSelection(from: number, to: number): void;
    toggleBold(): void;
    toggleItalic(): void;
    toggleUnderline(): void;
    toggleStrike(): void;
    toggleHeading(level: number): void;
    toggleBlockquote(): void;
    toggleCode(): void;
    toggleOrderedList(): void;
    toggleBulletList(): void;
    setLink(href: string): void;
    undo(): void;
    redo(): void;
  }

  export type BridgeSelection = { from: number; to: number };

  export type BridgeState = {
    isBoldActive: boolean;
    canToggleBold: boolean;
    isItalicActive: boolean;
    canToggleItalic: boolean;
    isUnderlineActive: boolean;
    canToggleUnderline: boolean;
    isStrikeActive: boolean;
    canToggleStrike: boolean;
    headingLevel?: number;
    canToggleHeading: boolean;
    isBlockquoteActive: boolean;
    canToggleBlockquote: boolean;
    isCodeActive: boolean;
    canToggleCode: boolean;
    isOrderedListActive: boolean;
    canToggleOrderedList: boolean;
    isBulletListActive: boolean;
    canToggleBulletList: boolean;
    isLinkActive: boolean;
    canSetLink: boolean;
    canUndo: boolean;
    canRedo: boolean;
    selection: BridgeSelection;
    activeLink?: string;
  };

  export interface RichTextProps {
    editor: EditorBridge;
    style?: import('react-native').StyleProp<
      import('react-native').ViewStyle | import('react-native').TextStyle
    >;
  }

  export const RichText: React.ComponentType<RichTextProps>;

  export function useEditorBridge(options: {
    bridgeExtensions: ReadonlyArray<unknown>;
    initialContent?: string;
    dynamicHeight?: boolean;
    avoidIosKeyboard?: boolean;
    onChange?: () => void;
  }): EditorBridge;

  export function useBridgeState(editor: EditorBridge): BridgeState;

  export const Images: Record<string, number>;

  export const BoldBridge: unknown;
  export const ItalicBridge: unknown;
  export const UnderlineBridge: unknown;
  export const StrikeBridge: unknown;
  export const HeadingBridge: unknown;
  export const OrderedListBridge: unknown;
  export const BulletListBridge: unknown;
  export const ListItemBridge: unknown;
  export const BlockquoteBridge: unknown;
  export const CodeBridge: unknown;
  export const LinkBridge: unknown;
  export const HistoryBridge: unknown;
  export const CoreBridge: unknown;
  export const HardBreakBridge: unknown;
  export const PlaceholderBridge: unknown;
}
