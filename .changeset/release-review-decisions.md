---
'@bitrate/api': minor
'@bitrate/admin': minor
'@bitrate/web-artists': minor
'@bitrate/contracts': minor
---

Bitrate operators can now review artist release submissions. A new release review queue in the
operator panel lists submissions oldest first. Each submission opens on its recordings with
playable masters, its rights, credits and shares, its delivery plan and its earlier decisions.
Operators holding `releases:review` approve a release or request changes, giving required changes
and optional recommendations; a decision only applies to the version the operator read and is
written to the audit log. Artists see the latest decision in their release workspace and can
reopen a release sent back for changes, then submit it again.
