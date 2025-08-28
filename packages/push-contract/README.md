# @hum/push-contract

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Platform-agnostic TypeScript contracts for push notification registration and payloads.

## Installation

```sh
npm install @hum/push-contract
```

## Usage

```ts
import { PushToken } from '@hum/push-contract';

const token: PushToken = { platform: 'fcm', value: 'abc' };
```

## Peer Dependencies

This package has no peer dependencies.
