---
'@bitrate/api': major
'@bitrate/contracts': major
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
'@bitrate/ui-react': minor
---

Registration now requires accepting the legal documents. The API rejects user and artist registration (and the creation of new accounts through Google or Facebook sign-in) unless the Terms of Use and Privacy Policy, and for artists the Artist Agreement, are accepted, and it stores the accepted revision and time on the account. The web player and artist apps show the matching required checkboxes and a notice next to the social sign-in buttons, and publish the draft legal documents under /legal/<document>; ui-react gains a Checkbox component.
