/** How long a JSON write may take before the client reports it as unconfirmed. */
const WRITE_TIMEOUT_MS = 30_000

/** A fresh abort signal for one JSON write. */
export const writeSignal = () => AbortSignal.timeout(WRITE_TIMEOUT_MS)
