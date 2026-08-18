---
'@spotify/web-player': minor
'@spotify/ui-react': minor
'@spotify/tokens': minor
---

The light theme reads as a designed counterpart to the dark one rather than an
inversion of it. The dark theme builds depth by floating lighter panels on a
near-black page; the light theme had flipped that relationship, making the page
pure white and the panels grey, so nothing could sit above anything and every
screen collapsed into one flat sheet. The page now recedes to a soft neutral,
panels come forward in white, hairlines carry the edges where white meets white,
and body copy uses a deep ink instead of full-strength black.

The home hero's ambient wash became a theme token, so it stays moody in the dark
and turns into a pale tint in the light instead of a saturated purple slab. The
gradients over the profile and playlist action bar, the carousel arrows, the
active library filter chip and the empty Liked Songs message no longer assume a
dark background.

Light-theme type was also toned down. Dark text on a light ground is rendered
with subpixel antialiasing that thickens every stroke, so the weights tuned for
the dark theme read as heavy-handed here: grayscale smoothing and a one-notch
step down across the bold range restore the intended feel without touching the
dark theme. Body copy sits on a soft graphite rather than near-black, and the
profile avatar's surround follows the theme instead of staying a dark disc.
