// Release dialogs for the release itself and its tracks (features/edit-release, features/release-media):
// edit details, schedule, artwork, add or replace audio, rename, ISRC, genres, remove track and delete
// release. Each builder returns the modal for desktop or phone (`m`).

/** Media and release dialog builders bound to the screen helpers `ui` and the release kit `k`. */
export function mediaDialogs(ui, k) {
  const { W, P, Row, Col, inline, Btn, Field, Option } = ui
  const save = (label) => [Btn('Cancel', 'Ghost'), Btn(label, 'Primary')]
  const dropzone = (title, hint, active = false) =>
    W(
      active ? 'Dropzone/Active' : 'Dropzone',
      { name: 'Drop zone', width: 'fill_container' },
      {
        title: { content: title },
        hint: { content: hint },
        action: inline('Action', [Btn('Choose file', 'Compact Outline', 'folder-open')]),
      },
    )
  const chips = (names, kind = 'Chip/Removable') =>
    Row(
      { name: 'Chips', gap: 6 },
      names.map((n) => W(kind, { name: `Chip / ${n}` }, { label: { content: n } })),
    )
  return {
    editRelease: (m) =>
      k.modal(
        m,
        'Edit draft',
        [
          P(
            'Muted',
            'Update the draft title and release type. Your music stays unpublished. Artwork and tracks are edited in the release workspace.',
          ),
          Field('Release title', 'Night Signal'),
          Field('Release type', 'Single', 'Select'),
        ],
        save('Save changes'),
      ),
    schedule: (m) =>
      k.modal(
        m,
        'Release timing',
        [
          P(
            'Muted',
            'Choose when listeners can hear it. You can change this until the release is published.',
          ),
          Option('Right away', 'It goes live as soon as you publish it.', false),
          Option('Premiere on a date', 'It goes live at the date and time you choose.', true),
          (m ? Col : Row)({ name: 'When', gap: 12, width: 'fill_container' }, [
            W('Field/Date', { name: 'Release date', width: 'fill_container' }),
            W('Field/Time', { name: 'Time', width: 'fill_container' }),
          ]),
          P('Caption', 'Time zone: UTC.'),
        ],
        save('Save schedule'),
      ),
    artwork: (m) =>
      k.modal(
        m,
        'Release artwork',
        [
          Row({ name: 'Preview', width: 'fill_container', justifyContent: 'center' }, [
            W('Artwork', { name: 'Selected artwork preview' }),
          ]),
          P(
            'Caption',
            'Square JPEG, PNG or WebP, up to 20 MB. Stores ask for at least 3000 × 3000 px.',
          ),
          Btn('Remove artwork', 'Danger', 'trash-2'),
        ],
        save('Save artwork'),
      ),
    upload: (m, o = {}) =>
      k.modal(
        m,
        o.replace ? 'Replace audio' : 'Upload track',
        [
          ...(o.replace
            ? [
                P(
                  'Muted',
                  'The current file (night-signal-master.wav) of Night Signal is replaced once the new one is saved.',
                ),
              ]
            : [Field('Track title', 'Low Tide'), P('Muted', 'Add the master for Low Tide.')]),
          o.progress
            ? W('Upload/Progress', { name: 'Upload progress', width: 'fill_container' })
            : dropzone(
                o.active ? 'Drop an audio file here' : 'No file chosen, or drop a file here',
                'WAV or FLAC masters are preferred; MP3 and OGG are accepted. Up to 512 MB. The file stays private to your workspace.',
                o.active,
              ),
          ...(o.error
            ? [
                W(
                  'Field/Error',
                  { name: 'Error' },
                  { text: { content: 'Choose a file up to 512 MB.' } },
                ),
              ]
            : []),
          P('Caption', 'You confirm the whole draft is accurate when you submit it for review.'),
        ],
        [
          Btn('Cancel', 'Ghost'),
          Btn(
            o.progress ? 'Uploading…' : o.replace ? 'Replace audio' : 'Upload track',
            'Primary',
            o.progress ? 'loader-circle' : null,
          ),
        ],
      ),
    rename: (m) =>
      k.modal(m, 'Rename track', [Field('Track title', 'Low Tide')], save('Save title'), 440),
    isrc: (m, error = false) =>
      k.modal(
        m,
        'Recording ISRC',
        [
          Field(
            'ISRC for Night Signal',
            error ? 'GB-BTR-26' : 'GB-BTR-26-00012',
            error ? 'Input Error' : 'Input',
            error ? 'Enter an ISRC such as US-RC1-76-07839.' : undefined,
          ),
          P(
            'Caption',
            'Optional. Format CC-XXX-YY-NNNNN. Leave empty if your distributor will assign one.',
          ),
        ],
        save('Save code'),
        440,
      ),
    genres: (m) =>
      k.modal(
        m,
        'Track genres',
        [
          P('Muted', 'Choose up to 3 genres. Listeners find the track under them once it is live.'),
          P('Caption', 'Chosen genres'),
          chips(['Synthwave', 'Electronic']),
          W(
            'Field/Search',
            { name: 'Find a genre', width: 'fill_container' },
            { value: { content: 'Find a genre' } },
          ),
          chips(['Ambient', 'Downtempo', 'House', 'Techno'], 'Chip'),
        ],
        save('Save genres'),
      ),
    removeTrack: (m) =>
      k.modal(
        m,
        'Remove track',
        [
          P(
            'Muted',
            'Remove Low Tide from the release? Its uploaded audio is deleted and its ISRC is freed. This cannot be undone.',
          ),
        ],
        [Btn('Keep track', 'Ghost'), Btn('Remove track', 'Danger')],
        440,
      ),
    deleteRelease: (m) =>
      k.modal(
        m,
        'Delete release',
        [
          P(
            'Muted',
            'Delete “Night Signal”? This removes the release from your workspace and the player. Recordings used by other releases remain available. This cannot be undone.',
          ),
        ],
        [Btn('Keep release', 'Ghost'), Btn('Delete release', 'Danger', 'trash-2')],
        440,
      ),
  }
}
