# @mchat/push-contract

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Platform-agnostic TypeScript contracts for push notification registration and payloads.

## Installation

```sh
npm install @mchat/push-contract
```

## Usage

```ts
import { PushToken } from '@mchat/push-contract';

const token: PushToken = { platform: 'fcm', value: 'abc' };
```

## Peer Dependencies

This package has no peer dependencies.
