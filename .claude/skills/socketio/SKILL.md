---
name: socketio
description: Socket.io gateway conventions for apps/api — gateway structure, authentication on connect, rooms, emitting from a service, and the scaling constraint. Use when adding or changing a WebSocket gateway, a real-time event, or when events reach the wrong clients or stop working behind more than one API instance.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Socket.io — real-time gateways in apps/api

`@nestjs/platform-socket.io` + `@nestjs/websockets`. The reference implementation is
`apps/api/src/modules/tracks/audio.gateway.ts`.

## Where the code lives

A gateway lives **in the module that owns its domain**, beside the service it works with —
`modules/tracks/audio.gateway.ts`, declared in `tracks.module.ts`'s `providers`. A gateway
is a provider like any other, so it can be injected and can inject.

## Gateway shape

```ts
@WebSocketGateway({ namespace: '/audio', cors: { origin: process.env.WEB_HOST } })
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  handleConnection(client: Socket) { /* authenticate here */ }
  handleDisconnect(client: Socket) { /* clean up rooms/state */ }

  @SubscribeMessage('track:subscribe')
  onSubscribe(@ConnectedSocket() client: Socket, @MessageBody() body: SubscribePayload) {
    client.join(`track:${body.trackId}`)
  }
}
```

Name every payload type. A `@MessageBody()` is untrusted client input — validate it the same
way you validate an HTTP body (a Zod schema, `ZodValidationPipe` via `@UsePipes`). An
unvalidated payload reaching a Prisma query is the same vulnerability it would be over HTTP.

## Authentication happens on connect

**HTTP guards do not protect socket events.** A `CanActivate` guard written for a controller
uses `ctx.switchToHttp()`, which returns nothing useful for a WS context. Authenticate once
in `handleConnection` — read the token from `client.handshake.auth` (preferred) or
`client.handshake.headers` — verify it, attach the user to `client.data`, and
`client.disconnect()` on failure.

```ts
handleConnection(client: Socket) {
  const token = client.handshake.auth?.token
  const user = this.jwt.verify(token)   // throws → disconnect
  client.data.user = user
}
```

Every `@SubscribeMessage` handler then trusts `client.data.user` rather than anything in the
payload. **Never take a user id from the message body** — that is impersonation by design.

## Rooms are the authorization boundary

Emitting to everyone (`server.emit`) is almost never right. Join clients to a room on
subscribe, and emit to the room:

```ts
this.server.to(`track:${trackId}`).emit('track:progress', { trackId, percent })
```

Before `client.join(room)`, check the user is allowed in it. A room the client names in a
payload is a client-chosen room — validate it against what that user may see.

## Emitting from a service

Inject the gateway into the service, not the other way round, and keep the gateway thin —
it is the transport, the service owns the logic:

```ts
// in a service, after work completes
this.audioGateway.emitProgress(trackId, percent)
```

Give the gateway a named method rather than reaching into `gateway.server` from a service;
that keeps the event names in one file.

## The scaling constraint — read this before deploying more than one instance

Socket.io keeps connections **in the memory of one process**. With two API instances behind
a load balancer, a client connected to instance A never receives an event emitted on
instance B. The symptom is "real-time works locally, works in staging with one replica, and
silently half-works in production".

Two things are needed:

1. **A Redis adapter** (`@socket.io/redis-adapter`) so emits propagate across instances.
   Redis is already a dependency of this API.
2. **Sticky sessions** at the load balancer, if the polling transport is enabled — the
   HTTP long-polling handshake must reach the same instance each time.

If you add a real-time feature and the deployment is multi-instance, say so explicitly in
your report; this is not something CI will catch.

## Testing

A gateway is a provider — unit-test its handlers directly with a fabricated `Socket`
(`{ data: {}, join: jest.fn(), emit: jest.fn() }`), asserting rooms joined and events
emitted. Full end-to-end socket testing needs a real server and a client; keep that to a
small number of E2E specs rather than testing every event that way.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/socket.io` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('socket.io/package.json').version"
   ```
2. **Then the official docs:** https://socket.io/docs/v4/ — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because v2/v3 examples are still everywhere and their handshake and adapter APIs differ.

## Related

- `nestjs` skill — DI, module wiring, why HTTP guards do not apply here.
- `.claude/rules/api-rules.md` — module anatomy.
- `jest` skill — unit and E2E patterns.
