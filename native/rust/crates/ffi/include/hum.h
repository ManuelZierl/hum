#ifndef HUM_H
#define HUM_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

/**
 * Opaque handle exposed to C.
 */
typedef struct HumClientHandle {
  uint8_t _private[0];
} HumClientHandle;

/**
 * Free a C string allocated by this library.
 */
void hum_free_string(char *s);

/**
 * Create a new client handle.
 */
struct HumClientHandle *hum_client_new(const char *hs_url, const char *store_path, char **err_out);

/**
 * Free a client handle.
 */
void hum_client_free(struct HumClientHandle *handle);

/**
 * Log in.
 */
int hum_client_login(struct HumClientHandle *handle,
                     const char *username,
                     const char *password,
                     char **err_out);

/**
 * Logout.
 */
int hum_client_logout(struct HumClientHandle *handle, char **err_out);

/**
 * Check auth state.
 */
int hum_client_is_authenticated(struct HumClientHandle *handle, bool *out_is_auth, char **err_out);

/**
 * Run one sync with timeout.
 */
int hum_client_sync_once(struct HumClientHandle *handle, uint64_t timeout_ms, char **err_out);

/**
 * Start continuous sync.
 */
int hum_client_start_sync_loop(struct HumClientHandle *handle, uint64_t timeout_ms, char **err_out);

/**
 * Stop continuous sync.
 */
int hum_client_stop_sync_loop(struct HumClientHandle *handle, char **err_out);

/**
 * Send text.
 */
int hum_client_send_text(struct HumClientHandle *handle,
                         const char *room_id,
                         const char *body,
                         char **err_out);

/**
 * Create a room; returns room_id.
 */
int hum_client_create_room(struct HumClientHandle *handle,
                           const char *name,
                           const char *topic,
                           bool is_public,
                           char **out_room_id,
                           char **err_out);

/**
 * Join a room by id or alias; returns room_id.
 */
int hum_client_join_room(struct HumClientHandle *handle,
                         const char *id_or_alias,
                         char **out_room_id,
                         char **err_out);

/**
 * Leave a room.
 */
int hum_client_leave_room(struct HumClientHandle *handle, const char *room_id, char **err_out);

/**
 * Get joined rooms as JSON array of { room_id, name }.
 */
int hum_client_get_rooms(struct HumClientHandle *handle, char **out_json, char **err_out);

/**
 * Send reaction.
 */
int hum_client_send_reaction(struct HumClientHandle *handle,
                             const char *room_id,
                             const char *event_id,
                             const char *key,
                             char **err_out);

/**
 * Redact event.
 */
int hum_client_redact(struct HumClientHandle *handle,
                      const char *room_id,
                      const char *event_id,
                      const char *reason,
                      char **err_out);

/**
 * Set typing state.
 */
int hum_client_set_typing(struct HumClientHandle *handle,
                          const char *room_id,
                          bool is_typing,
                          uint32_t timeout_ms,
                          char **err_out);

/**
 * Import recovery key (bootstrap secret storage).
 */
int hum_client_import_recovery_key(struct HumClientHandle *handle, const char *key, char **err_out);

/**
 * Search users; returns a JSON string array of { user_id, display_name }.
 */
int hum_client_search_users(struct HumClientHandle *handle,
                            const char *query,
                            uint32_t limit,
                            char **out_json,
                            char **err_out);

/**
 * Get devices; returns a JSON string array of { device_id, display_name }.
 */
int hum_client_get_devices(struct HumClientHandle *handle, char **out_json, char **err_out);

/**
 * Rename a device.
 */
int hum_client_rename_device(struct HumClientHandle *handle,
                             const char *device_id,
                             const char *name,
                             char **err_out);

/**
 * Delete a device.
 */
int hum_client_delete_device(struct HumClientHandle *handle, const char *device_id, char **err_out);

/**
 * Upload media. `data` is not owned and will not be freed by this function.
 */
int hum_client_upload_media(struct HumClientHandle *handle,
                            const uint8_t *data,
                            uintptr_t len,
                            const char *mime,
                            char **out_uri,
                            char **err_out);

/**
 * Download media into an allocated buffer; caller must free via `hum_free_buf`.
 */
int hum_client_download_media(struct HumClientHandle *handle,
                              const char *uri,
                              uint8_t **out_buf,
                              uintptr_t *out_len,
                              char **err_out);

/**
 * Free a buffer allocated by this library.
 */
void hum_free_buf(uint8_t *ptr, uintptr_t _len);

/**
 * Send read receipt.
 */
int hum_client_send_read_receipt(struct HumClientHandle *handle,
                                 const char *room_id,
                                 const char *event_id,
                                 char **err_out);

/**
 * Set presence: 0 Online, 1 Idle, 2 DoNotDisturb, 3 Invisible
 */
int hum_client_set_presence(struct HumClientHandle *handle, uint32_t state, char **err_out);

/**
 * Get presence for a user id; writes presence code as in `hum_client_set_presence`.
 */
int hum_client_get_presence(struct HumClientHandle *handle,
                            const char *user_id,
                            uint32_t *out_state,
                            char **err_out);

#endif /* HUM_H */
