# @bitrate/tailwind

## 1.2.0

### Minor Changes

- fe5b6ad: Review feedback is now one Markdown message: reviewers write it in a single editor with a formatting toolbar in the admin, and artists see it formatted. The API drops the separate required-change and recommendation lists (a migration folds existing ones into the message), so this is a breaking contract change. Artists split only the master now: publishing shares and the songwriter confirmation are no longer asked for or required, and new releases start with the artist as master owner. The artist workspace also gets a submit preview, a reworked draft step and stepper, a new analytics layout, a mini player with volume in Music, release artwork on track rows, page entrance animations and interface sounds that can be turned off in Settings.

## 1.1.0

### Minor Changes

- 64c95eb: Added the shadcn sidebar roles (`sidebar-*`), status callout triads (`info|success|warning|error-text|surface|border`) and the `shadow` and `scrim` roles, so the Pencil design library mirrors the code palette one to one.

### Patch Changes

- 2130dfd: The seek and volume sliders show their whole range: a new `progress-track` role draws the unplayed rail behind the primary fill in every theme.
