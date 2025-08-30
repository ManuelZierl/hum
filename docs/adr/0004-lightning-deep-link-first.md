# 0004: Lightning payments via deep-link first

- Status: Accepted
- Date: 2025-08-20

## Context

Supporting Lightning Network payments is a project goal. Embedding a wallet is complex and may delay core messaging features.

## Decision

Initial Lightning support will use deep-links to existing wallet apps. Users can send and receive payments through their preferred wallet without embedding wallet code in the app.

## Consequences

- Enables Lightning payments early in the project.
- Reduces security and maintenance burden by relying on established wallets.
- Requires users to have a compatible Lightning wallet installed.
- Later work needed to embed wallet functionality directly.
