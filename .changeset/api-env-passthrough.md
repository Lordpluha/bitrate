---
'@bitrate/api': minor
---

Ten variables the API expects now actually reach it in production.

The compose file listed neither the OAuth credentials nor six token and health settings in the api
service's environment, so the container never received them. Verified on the running production
container: all ten were absent. The consequences were silent — the API fell back to its schema
defaults for token lifetimes, cookie names, the health-check timeout and the mail token flag, so
changing any of them in `.env` did nothing at all; and Google and Facebook sign-in could not work
in production regardless of configuration, because neither client id nor secret was passed through.

They are declared by bare name, the convention the rest of that list already uses: an unset variable
stays absent rather than arriving as an empty string, which the API's schema would reject.
