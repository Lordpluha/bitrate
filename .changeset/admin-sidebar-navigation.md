---
'@bitrate/admin': minor
---

Rebuilt the operator panel's navigation. The rail is resizable by dragging its edge, remembers its width per browser, and collapses to a 64px icon column — by button, by dragging below a threshold, or by arrow keys on the handle, which carries a `separator` role so assistive tech announces it as resizable rather than as decoration. Destinations now carry Lucide icons and sit under section captions rather than in one flat list, and the Bitrate mark heads the rail, keeping its own gradient in every theme because a logo that restyles is a different logo.

The navigation is data now, with three structural levels and a deliberate visual treatment each: a section is a caption plus space, not a rule, because rules between every group turn a short list into a ladder; a link marks its active state with both a filled surface and a leading rail, so it never depends on colour alone; and a nested group's children indent, drop their icons and gain a vertical guide, which is what stops subordinate rows reading as more equal destinations. Collapsed, a caption cannot shrink to an icon, so it is replaced by a hairline instead of being truncated.
