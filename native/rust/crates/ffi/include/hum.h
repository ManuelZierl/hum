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

void hum_free_string(char *s);

struct HumClientHandle *hum_client_new(const char *hs_url, const char *store_path, char **err_out);

void hum_client_free(struct HumClientHandle *handle);

int hum_client_login(struct HumClientHandle *handle,
                     const char *username,
                     const char *password,
                     char **err_out);

int hum_client_logout(struct HumClientHandle *handle, char **err_out);

int hum_client_is_authenticated(struct HumClientHandle *handle, bool *out_is_auth, char **err_out);

int hum_client_sync_once(struct HumClientHandle *handle, uint64_t timeout_ms, char **err_out);

int hum_client_start_sync_loop(struct HumClientHandle *handle, uint64_t timeout_ms, char **err_out);

int hum_client_stop_sync_loop(struct HumClientHandle *handle, char **err_out);

int hum_client_send_text(struct HumClientHandle *handle,
                         const char *room_id,
                         const char *body,
                         char **err_out);

int hum_client_create_room(struct HumClientHandle *handle,
                           const char *name,
                           const char *topic,
                           bool is_public,
                           char **out_room_id,
                           char **err_out);

int hum_client_join_room(struct HumClientHandle *handle,
                         const char *id_or_alias,
                         char **out_room_id,
                         char **err_out);

int hum_client_leave_room(struct HumClientHandle *handle, const char *room_id, char **err_out);

int hum_client_get_rooms(struct HumClientHandle *handle, char **out_json, char **err_out);

int hum_client_send_reaction(struct HumClientHandle *handle,
                             const char *room_id,
                             const char *event_id,
                             const char *key,
                             char **err_out);

int hum_client_redact(struct HumClientHandle *handle,
                      const char *room_id,
                      const char *event_id,
                      const char *reason,
                      char **err_out);

int hum_client_set_typing(struct HumClientHandle *handle,
                          const char *room_id,
                          bool is_typing,
                          uint32_t timeout_ms,
                          char **err_out);

int hum_client_import_recovery_key(struct HumClientHandle *handle, const char *key, char **err_out);

int hum_client_search_users(struct HumClientHandle *handle,
                            const char *query,
                            uint32_t limit,
                            char **out_json,
                            char **err_out);

int hum_client_get_devices(struct HumClientHandle *handle, char **out_json, char **err_out);

int hum_client_rename_device(struct HumClientHandle *handle,
                             const char *device_id,
                             const char *name,
                             char **err_out);

int hum_client_delete_device(struct HumClientHandle *handle, const char *device_id, char **err_out);

int hum_client_upload_media(struct HumClientHandle *handle,
                            const uint8_t *data,
                            uintptr_t len,
                            const char *mime,
                            char **out_uri,
                            char **err_out);

int hum_client_download_media(struct HumClientHandle *handle,
                              const char *uri,
                              uint8_t **out_buf,
                              uintptr_t *out_len,
                              char **err_out);

void hum_free_buf(uint8_t *ptr, uintptr_t _len);

int hum_client_send_read_receipt(struct HumClientHandle *handle,
                                 const char *room_id,
                                 const char *event_id,
                                 char **err_out);

int hum_client_set_presence(struct HumClientHandle *handle, uint32_t state, char **err_out);

int hum_client_get_presence(struct HumClientHandle *handle,
                            const char *user_id,
                            uint32_t *out_state,
                            char **err_out);

#endif /* HUM_H */
