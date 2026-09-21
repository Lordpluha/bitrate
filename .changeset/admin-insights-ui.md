---
'@bitrate/admin': minor
---

Added the operator panel's half of three insights features backed by the already-verified API
endpoints: the overview dashboard replaced its recent-operator-actions list with hand-written
SVG charts (new accounts, listens, uploads by outcome, and reports filed plus their current
status breakdown) over a 7/30/90-day range control kept in the URL, each chart backed by an
accessible visually-hidden data table; the listener detail page gained a paginated listening
history section; and the artist detail page gained paginated tracks and albums sections. The
charts were then reworked to fix user-reported gaps: real x/y axes with nicely-rounded ticks
and thinned date labels, an honest fixed-aspect layout instead of a distorting
`preserveAspectRatio="none"`, a keyboard-accessible hover tooltip with exact values (and the
stacked total), and a one-line description of what each chart counts, its UTC window, and its
unit — plus a deliberate grid grouping the two reports charts together instead of leaving one
chart alone in the row. Fixed two more reported defects: axis-label text now stays a constant
size across every chart instead of scaling with each card's column width, chart cards in the
same row now share a uniform height, and a hover tooltip near a card's edge can no longer widen
the page and trigger an extra horizontal scrollbar.
