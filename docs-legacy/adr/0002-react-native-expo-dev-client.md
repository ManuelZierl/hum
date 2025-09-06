# 0002: Use React Native with Expo Dev Client for UI

- Status: Accepted
- Date: 2025-08-20

## Context

The project targets iOS and Android with a single codebase while maintaining a native feel. Expo Dev Client provides a customizable runtime for React Native apps and streamlines development.

## Decision

Build the mobile interface using React Native and Expo Dev Client. This choice allows rapid iteration with JavaScript and TypeScript while keeping the option to add native modules when necessary.

## Consequences

- Single codebase for multiple platforms.
- Faster development and hot-reload during the prototyping phase.
- Dependency on the Expo ecosystem and React Native updates.
- Potential performance trade-offs compared to fully native implementations.
