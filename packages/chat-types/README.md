# @mchat/chat-types

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Shared TypeScript definitions and mocks for mchat domain models.

## Installation

```sh
npm install @mchat/chat-types
```

## Usage

```ts
import { mockChat } from '@mchat/chat-types';

const chat = mockChat();
console.log(chat.messages[0].text);
```

## Peer Dependencies

This package has no peer dependencies.
