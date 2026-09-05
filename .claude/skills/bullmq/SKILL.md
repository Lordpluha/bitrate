---
name: bullmq
description: BullMQ job queue conventions for apps/api — where consumers and producers live, registering a queue, job options (retries, backoff, idempotency), and testing a consumer. Use when adding or changing a background job, a @Processor consumer, or a queue registration, or when a job retries forever or runs twice.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# BullMQ — background jobs in apps/api

Redis-backed queues via `@nestjs/bullmq`. The reference implementation is audio processing:
`apps/api/src/modules/tracks/audio-processing.consumer.ts`, enqueued from
`tracks.service.ts`, registered in `tracks.module.ts`.

## Where the code lives

**Jobs live in the module that owns them** — not in a shared `infra/queues/` folder. A
consumer sits beside the service that enqueues to it:

```
apps/api/src/modules/tracks/
  tracks.service.ts                 # producer — injects the Queue, adds jobs
  audio-processing.consumer.ts      # consumer — @Processor, does the work
  tracks.module.ts                  # BullModule.registerQueue(...)
```

The Redis connection is configured once in `app.module.ts`; a module only registers the
queue names it uses.

## Registering and producing

```ts
// tracks.module.ts
@Module({
  imports: [BullModule.registerQueue({ name: 'audio-processing' })],
  providers: [TracksService, AudioProcessingConsumer],
})
export class TracksModule {}

// tracks.service.ts
constructor(@InjectQueue('audio-processing') private readonly queue: Queue) {}

await this.queue.add('process', { trackId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: 100,
  removeOnFail: 1_000,
})
```

**The queue name is a string in two places** — the registration and the `@InjectQueue`/
`@Processor` decorators. A typo produces a provider-resolution error at startup, which is
the good outcome; a typo matching *another* registered queue silently sends jobs nowhere
useful. Extract the name to a shared constant when a module has more than one.

## Consuming

```ts
@Processor('audio-processing')
export class AudioProcessingConsumer extends WorkerHost {
  async process(job: Job<AudioProcessingPayload>): Promise<void> {
    const { trackId } = job.data
    // ...
  }
}
```

Name the payload type — it crosses a process boundary and is the contract between producer
and consumer. `job.data` is deserialized JSON: `Date`s arrive as strings, `undefined` is
dropped, class instances become plain objects. Do not put anything in a payload that does
not survive `JSON.stringify`.

## The three failure modes worth designing for

**1. Jobs run more than once.** A worker can crash after doing the work and before acking,
and BullMQ will retry. Make the handler idempotent: check whether the effect already
happened before doing it again. "Processed track 42" must be safe to run twice.

**2. Jobs retry forever.** A permanently-failing job with generous `attempts` and no
distinction between transient and permanent errors burns Redis and CPU. Throw
`UnrecoverableError` for a payload that can never succeed (missing record, malformed data)
so BullMQ stops retrying it:

```ts
if (!track) throw new UnrecoverableError(`Track ${trackId} no longer exists`)
```

Retries are for transient failures — network, lock contention, a service that was briefly
down.

**3. Payloads carry stale data.** Pass an **id**, not a snapshot of the row. By the time the
job runs, the entity may have changed; re-read it in the consumer. A payload carrying the
whole entity is how a job overwrites newer data with older data.

## Events and observability

`@OnWorkerEvent('failed' | 'completed' | 'active')` on the consumer class gives you the
hooks for logging and metrics. Log the job id and name, never the whole payload — payloads
can carry user data.

## Testing

A consumer is a plain injectable — unit-test `process()` directly with a fabricated `Job`,
no Redis:

```ts
await consumer.process({ data: { trackId: 'abc' } } as Job<AudioProcessingPayload>)
```

For a producer, assert the enqueue rather than the effect: mock the `Queue` and check
`add` was called with the expected name, payload, and options. `getQueueToken('audio-processing')`
is the provider token to override in a `TestingModule`.

Integration specs that need a real queue need real Redis —
`docker-compose -f infra/docker-compose.dev.yaml up -d`. See the `jest` skill.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/bullmq` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('bullmq/package.json').version"
   ```
2. **Then the official docs:** https://docs.bullmq.io — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because BullMQ and the older Bull have different APIs and most blog posts mean Bull.

## Related

- `nestjs` skill — DI, module wiring, lifecycle hooks (workers need clean shutdown).
- `.claude/rules/api-rules.md` — module anatomy.
- `jest` skill — unit and integration patterns.
