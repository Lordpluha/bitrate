---
'@bitrate/docs': patch
'@bitrate/ui-react': patch
---

The documentation and Storybook sites stop redirecting visitors to an internal address.

nginx builds an absolute `Location` from its own scheme and listening port. Inside these containers
those are `http` and `8080`, so following any link without a trailing slash sent the browser to
`http://docs.bitrate.me:8080/…` — a port that is not published and a scheme that is not encrypted.
Every navigation link on a Docusaurus site is affected, which is why the sites looked fine on a
direct URL and broke as soon as anyone clicked anything.

`absolute_redirect off` makes the `Location` relative, so the browser resolves it against the URL
it actually requested and the edge proxy's scheme and host survive.
