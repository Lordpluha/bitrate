---
'@bitrate/api': patch
---

Fixed failed sign-ins returning 500 instead of 401 on all three authentication surfaces. The
lockout bookkeeping ran a raw `UPDATE ... SET "lockedUntil" = CASE ... ELSE NULL END`, where
neither branch carried a type, so PostgreSQL resolved the expression to `text` and refused to
assign it to the `timestamp(3)` column (SQLSTATE 42804). Every wrong password therefore crashed
before the account could be locked, which also meant the brute-force lockout had never actually
engaged. The three services now do the same work with typed Prisma writes — an atomic counter
increment followed by a conditional deadline write — and an end-to-end spec exercises the
counter, the lockout threshold, and the deadline it stores.
