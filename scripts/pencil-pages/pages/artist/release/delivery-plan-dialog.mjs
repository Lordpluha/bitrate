// The delivery plan dialog (features/delivery-plan DeliveryPlanDialog): stores to plan, worldwide or
// selected countries with search and chips, the country requirement and the save errors (`o.error`).

const STORES = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL']
const PLANNED = ['Spotify', 'Apple Music', 'YouTube Music', 'Deezer']

/** `(m, o) → modal` bound to the screen helpers `ui` and the release kit `k`. */
export function deliveryPlanDialog(ui, k) {
  const { W, P, Row, Col, Btn, Option } = ui
  return (m, o = {}) =>
    k.modal(
      m,
      'Delivery plan',
      [
        P(
          'Muted',
          'Plan where this release should go. Saving the plan sends nothing: delivery starts only once a distribution partner is connected.',
        ),
        P('Body Strong', 'Stores'),
        Col(
          { name: 'Stores', gap: 6, width: 'fill_container' },
          STORES.map((s) =>
            W(
              PLANNED.includes(s) ? 'Check/Box Checked' : 'Check/Box',
              { name: `Store / ${s}`, width: 'fill_container' },
              { label: { content: s } },
            ),
          ),
        ),
        P('Body Strong', 'Territories'),
        Option('Worldwide', 'Countries where listeners can find it.', !o.selected),
        Option(
          'Selected countries',
          o.selected ? '2 selected: Poland, Ukraine' : 'No countries selected',
          Boolean(o.selected),
        ),
        ...(o.selected
          ? [
              W(
                'Field/Search',
                { name: 'Search countries', width: 'fill_container' },
                { value: { content: 'Search countries' } },
              ),
              Row(
                { name: 'Chosen', gap: 6 },
                ['Poland', 'Ukraine'].map((c) =>
                  W('Chip/Removable', { name: `Country / ${c}` }, { label: { content: c } }),
                ),
              ),
            ]
          : []),
        ...(o.noCountry
          ? [
              W(
                'Field/Error',
                { name: 'Countries' },
                { text: { content: 'Choose at least one country, or deliver worldwide.' } },
              ),
            ]
          : []),
        ...(o.error ? [k.note('Error', o.error)] : []),
      ],
      [
        Btn('Cancel', 'Ghost'),
        Btn(o.busy ? 'Saving…' : 'Save plan', 'Primary', o.busy ? 'loader-circle' : 'check'),
      ],
    )
}
