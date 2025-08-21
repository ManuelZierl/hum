declare const process: { env: Record<string, string | undefined> };

export type TelemetryProps = Record<string, unknown>;

/**
 * track sends a telemetry event. Currently a no-op unless telemetry is enabled.
 *
 * @param event - The name of the event to track.
 * @param props - Optional event properties.
 */
export function track(event: string, props?: TelemetryProps): void {
  if (process.env.ENABLE_TELEMETRY === 'true') {
    // Telemetry backend not implemented yet.
    // This is a placeholder to be replaced when telemetry is added.
    void event;
    void props;
  }
export function track(_event: string, _props?: TelemetryProps): void {
  if (process.env.ENABLE_TELEMETRY === 'true') {
    // Telemetry backend not implemented yet.
    // This is a placeholder to be replaced when telemetry is added.
    // Parameters intentionally unused.
  }
}
