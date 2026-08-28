---
'@spotify/ui-react': patch
---

The `HoverCard` primitive ships with the coverage every other component in the
package has: unit, integration, snapshot and screenshot specs plus a Storybook
entry. It previously exported only the component and its barrel, so its
`asChild` contract — which throws on anything but a single element — was
untested.
