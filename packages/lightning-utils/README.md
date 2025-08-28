# @hum/lightning-utils

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Utilities for detecting and normalising Lightning Network payment strings.

## Installation

```sh
npm install @hum/lightning-utils
```

## Usage

```ts
import { detectPaymentStrings } from '@hum/lightning-utils';

const matches = detectPaymentStrings('pay to lnbc1...');
```

## Peer Dependencies

This package has no peer dependencies.
