# Matrix Engine

Minimal Matrix client engine based on `matrix-sdk`.

## Examples

Login and list rooms:

```bash
mx_demo --homeserver https://matrix.org --username alice --password secret --store ./store
```

Send a message:

```bash
mx_demo --homeserver https://matrix.org --username alice --password secret --store ./store --send '!roomid:matrix.org' 'Hello world'
```

Restore existing session:

```bash
mx_demo --homeserver https://matrix.org --store ./store
```
