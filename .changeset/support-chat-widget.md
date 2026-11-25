---
'@bitrate/ui-react': minor
---

Added `SupportChat`: a floating support chat with a button that opens a panel holding the conversation, the sources of an answer, a status line and a composer. It covers the empty, streaming, waiting-for-operator, operator-replied, error, limited and offline states. The component is presentational: the app passes the messages, the status and the translated labels.
