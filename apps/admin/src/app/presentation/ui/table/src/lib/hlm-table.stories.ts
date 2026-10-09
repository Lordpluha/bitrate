import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmBadge } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '../index'
import { HlmTable } from './hlm-table'

const ROWS = [
  { title: 'Night Drive', artist: 'Kavinsky', plays: '1,204,331', status: 'Active' },
  { title: 'Resonance', artist: 'Home', plays: '987,120', status: 'Active' },
  { title: 'Sunset', artist: 'The Midnight', plays: '450,002', status: 'Deactivated' },
]

const meta = {
  title: 'UI/Table',
  component: HlmTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmTableImports, HlmBadge] })],
  parameters: { layout: 'padded' },
  render: () => ({
    props: { rows: ROWS },
    template: `
      <div hlmTableContainer>
        <table hlmTable>
          <caption hlmCaption>Top tracks this week</caption>
          <thead hlmTHead>
            <tr hlmTr>
              <th hlmTh scope="col">Title</th>
              <th hlmTh scope="col">Artist</th>
              <th hlmTh scope="col" class="text-right">Plays</th>
              <th hlmTh scope="col">Status</th>
            </tr>
          </thead>
          <tbody hlmTBody>
            @for (row of rows; track row.title) {
              <tr hlmTr>
                <td hlmTd class="font-medium">{{ row.title }}</td>
                <td hlmTd>{{ row.artist }}</td>
                <td hlmTd class="text-right tabular-nums">{{ row.plays }}</td>
                <td hlmTd>
                  <span hlmBadge [variant]="row.status === 'Active' ? 'secondary' : 'outline'">{{ row.status }}</span>
                </td>
              </tr>
            }
          </tbody>
          <tfoot hlmTFoot>
            <tr hlmTr>
              <td hlmTd colspan="2">Total</td>
              <td hlmTd class="text-right tabular-nums">2,641,453</td>
              <td hlmTd></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,
  }),
} satisfies Meta<HlmTable>

export default meta
type Story = StoryObj<HlmTable>

export const Default: Story = {}

export const Empty: Story = {
  render: () => ({
    template: `
      <div hlmTableContainer>
        <table hlmTable>
          <thead hlmTHead>
            <tr hlmTr>
              <th hlmTh scope="col">Title</th>
              <th hlmTh scope="col">Artist</th>
              <th hlmTh scope="col">Status</th>
            </tr>
          </thead>
          <tbody hlmTBody>
            <tr hlmTr>
              <td hlmTd colspan="3" class="py-6 text-center text-muted-foreground">No tracks match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
}
