import React from 'react';
import { View } from 'react-native';

const editorStub = {
  toggleBold: () => {},
  toggleItalic: () => {},
  toggleUnderline: () => {},
  toggleStrike: () => {},
  toggleHeading: () => {},
  toggleBlockquote: () => {},
  toggleCode: () => {},
  toggleOrderedList: () => {},
  toggleBulletList: () => {},
  setLink: () => {},
  undo: () => {},
  redo: () => {},
  focus: () => {},
  setPlaceholder: () => {},
  setSelection: () => {},
  setContent: () => {},
  getHTML: async () => '<p></p>',
  getText: async () => '',
};

const bridgeStateStub = {
  isBoldActive: false,
  canToggleBold: true,
  isItalicActive: false,
  canToggleItalic: true,
  isUnderlineActive: false,
  canToggleUnderline: true,
  isStrikeActive: false,
  canToggleStrike: true,
  headingLevel: undefined,
  canToggleHeading: true,
  isBlockquoteActive: false,
  canToggleBlockquote: true,
  isCodeActive: false,
  canToggleCode: true,
  isOrderedListActive: false,
  canToggleOrderedList: true,
  isBulletListActive: false,
  canToggleBulletList: true,
  isLinkActive: false,
  canSetLink: true,
  canUndo: true,
  canRedo: true,
  selection: { from: 0, to: 0 },
  activeLink: undefined,
};

export const RichText = ({ children }: { children?: React.ReactNode }) => (
  <View>{children}</View>
);

export const useEditorBridge = () => editorStub;
export const useBridgeState = () => bridgeStateStub;

export const Images = {
  bold: 1,
  italic: 2,
  underline: 3,
  strikethrough: 4,
  h1: 5,
  h2: 6,
  h3: 7,
  quote: 8,
  code: 9,
  orderedList: 10,
  bulletList: 11,
  link: 12,
  undo: 13,
  redo: 14,
};

export const BoldBridge = {};
export const ItalicBridge = {};
export const UnderlineBridge = {};
export const StrikeBridge = {};
export const HeadingBridge = {};
export const OrderedListBridge = {};
export const BulletListBridge = {};
export const BlockquoteBridge = {};
export const CodeBridge = {};
export const LinkBridge = {};
export const HistoryBridge = {};
export const ListItemBridge = {};
export const HardBreakBridge = {};
export const PlaceholderBridge = {};
export const CoreBridge = {};
