# @hum/chat-types

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Shared TypeScript definitions and mocks for hum domain models.

## Installation

```sh
npm install @hum/chat-types
```

## Usage

```ts
import { mockChat } from '@hum/chat-types';

const chat = mockChat();
console.log(chat.messages[0].text);
```

## Peer Dependencies

This package has no peer dependencies.
