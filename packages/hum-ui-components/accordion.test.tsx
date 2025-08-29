/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
jest.mock('react-native', () => {
  const create =
    (name: string) =>
    ({ children, ...props }: any) => ({
      type: name,
      props: { ...props, children },
    });
  return {
    View: create('View'),
    Text: create('Text'),
    Pressable: create('Pressable'),
    StyleSheet: { create: (s: any) => s, hairlineWidth: 1 },
    useColorScheme: jest.fn(() => 'light'),
  };
});

import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

function render(element: any): any {
  if (element == null || typeof element !== 'object') return element;
  if (typeof element.type === 'function') {
    return render(element.type(element.props));
  }
  const { children, ...rest } = element.props || {};
  const renderedChildren = Array.isArray(children)
    ? children.map(render)
    : children !== undefined
      ? [render(children)]
      : [];
  return { type: element.type, props: { ...rest, children: renderedChildren } };
}

function findNode(node: any, type: string, text?: string): any | undefined {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === type) {
    const child = node.props.children;
    if (
      text === undefined ||
      child === text ||
      (Array.isArray(child) && child.includes(text))
    ) {
      return node;
    }
  }
  const children = node.props?.children || [];
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findNode(child, type, text);
    if (found) return found;
  }
  return undefined;
}

function findAll(node: any, type: string, acc: any[] = []): any[] {
  if (!node || typeof node !== 'object') return acc;
  if (node.type === type) acc.push(node);
  const children = node.props?.children || [];
  for (const child of Array.isArray(children) ? children : [children]) {
    findAll(child, type, acc);
  }
  return acc;
}

function flatten(style: any): any {
  return Array.isArray(style)
    ? style.reduce((acc: any, cur: any) => Object.assign(acc, cur), {})
    : style;
}

describe('Accordion', () => {
  it('renders without crashing', () => {
    const element = React.createElement(
      Accordion as any,
      { value: 'item1', onValueChange: jest.fn() } as any,
      React.createElement(
        AccordionItem as any,
        { value: 'item1' } as any,
        React.createElement(AccordionTrigger as any, null, 'Item 1'),
        React.createElement(AccordionContent as any, null, 'Content 1'),
      ),
    );
    const tree = render(element);
    expect(tree).toMatchSnapshot();
  });

  it('calls onValueChange with single value', () => {
    const onChange = jest.fn();
    const element = React.createElement(
      Accordion as any,
      { value: '', onValueChange: onChange } as any,
      React.createElement(
        AccordionItem as any,
        { value: 'a' } as any,
        React.createElement(AccordionTrigger as any, null, 'A'),
      ),
    );
    const tree = render(element);
    const pressable = findNode(tree, 'Pressable');
    pressable.props.onPress();
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('calls onValueChange with array when multiple', () => {
    const onChange = jest.fn();
    const element = React.createElement(
      Accordion as any,
      { value: ['a'], type: 'multiple', onValueChange: onChange } as any,
      React.createElement(
        AccordionItem as any,
        { value: 'a' } as any,
        React.createElement(AccordionTrigger as any, null, 'A'),
      ),
      React.createElement(
        AccordionItem as any,
        { value: 'b' } as any,
        React.createElement(AccordionTrigger as any, null, 'B'),
      ),
    );
    const tree = render(element);
    const pressables = findAll(tree, 'Pressable');
    pressables[1].props.onPress();
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('exposes accessibility props', () => {
    const element = React.createElement(
      Accordion as any,
      { value: 'item1', onValueChange: jest.fn() } as any,
      React.createElement(
        AccordionItem as any,
        { value: 'item1' } as any,
        React.createElement(AccordionTrigger as any, null, 'Item 1'),
      ),
    );
    const tree = render(element);
    const pressable = findNode(tree, 'Pressable');
    expect(pressable.props.accessibilityRole).toBe('button');
    expect(pressable.props.accessibilityState.expanded).toBe(true);
  });

  it('applies light and dark theme styles', () => {
    const rn = require('react-native');
    rn.useColorScheme.mockReturnValue('light');
    const lightTree = render(
      React.createElement(
        AccordionItem as any,
        { value: 'x', openValues: ['x'] } as any,
        React.createElement(AccordionTrigger as any, null, 'Txt'),
      ),
    );
    const lightText = findNode(lightTree, 'Text', 'Txt');
    expect(flatten(lightText.props.style).color).toBe('#000000');

    rn.useColorScheme.mockReturnValue('dark');
    const darkTree = render(
      React.createElement(
        AccordionItem as any,
        { value: 'x', openValues: ['x'] } as any,
        React.createElement(AccordionTrigger as any, null, 'Txt'),
      ),
    );
    const darkText = findNode(darkTree, 'Text', 'Txt');
    expect(flatten(darkText.props.style).color).toBe('#ffffff');
  });
});
