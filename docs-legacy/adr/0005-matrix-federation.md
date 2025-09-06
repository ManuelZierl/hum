# 0005: Federation via Matrix protocol

- Status: Accepted
- Date: 2025-08-20

## Context

The project aims to avoid walled gardens and interoperate with other messaging systems. Matrix provides an open standard for secure, decentralized communication.

## Decision

Adopt the Matrix protocol for federation. Servers and clients will communicate using Matrix APIs, enabling interoperability with the wider Matrix ecosystem.

## Consequences

- Aligns the project with a well-supported open protocol.
- Allows communication with existing Matrix users and servers.
- Requires handling Matrix-specific concepts such as rooms and events.
- Server infrastructure must support Matrix federation requirements.
