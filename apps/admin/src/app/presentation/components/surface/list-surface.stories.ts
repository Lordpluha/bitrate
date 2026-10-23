import { provideRouter, withDisabledInitialNavigation } from '@angular/router'
import { provideIcons } from '@ng-icons/core'
import { lucideClock, lucideFlag, lucideShieldCheck, lucideTriangleAlert } from '@ng-icons/lucide'
import { HlmBadge } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { applicationConfig, type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { FilterMenu } from './filter-menu'
import { MetricStrip, MetricTile } from './metric-tile'
import { PageHeader } from './page-header'
import { SearchField } from './search-field'
import { SkeletonRows } from './skeleton'
import { StateMessage } from './state-message'
import { PanelBar, TablePanel } from './table-panel'

const STATUS = [
  { value: null, label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'REVIEWING', label: 'Reviewing' },
]

const ROWS = [
  { what: 'Track · Night Drive', reason: 'Copyright', status: 'Open', tone: 'destructive' },
  { what: 'Playlist · Late shift', reason: 'Spam', status: 'Reviewing', tone: 'warning' },
  { what: 'Artist · Home', reason: 'Impersonation', status: 'Resolved', tone: 'success' },
]

/** A list screen as the design draws it: header, KPI strip, then the table panel. */
const meta = {
  title: 'Surface/List screen',
  component: TablePanel,
  tags: ['autodocs'],
  decorators: [
    // No initial navigation: no route matches the iframe's path, and a failed navigation resets
    // the document URL — which, published under /admin/, sends every lazy story chunk to the root.
    applicationConfig({ providers: [provideRouter([], withDisabledInitialNavigation())] }),
    moduleMetadata({
      imports: [
        FilterMenu,
        HlmBadge,
        HlmButtonImports,
        HlmTableImports,
        MetricStrip,
        MetricTile,
        PageHeader,
        PanelBar,
        SearchField,
        SkeletonRows,
        StateMessage,
      ],
      providers: [
        provideIcons({ lucideClock, lucideFlag, lucideShieldCheck, lucideTriangleAlert }),
      ],
    }),
  ],
  parameters: { layout: 'padded' },
  args: { state: 'rows' },
  argTypes: {
    state: { control: 'inline-radio', options: ['rows', 'loading', 'empty', 'noResults', 'error'] },
  },
  render: (args) => ({
    props: { ...args, statuses: STATUS, rows: ROWS },
    template: `
      <div class="flex flex-col gap-5">
        <app-page-header eyebrow="Operations" title="Moderation" subtitle="Reports filed by listeners.">
          <button headerActions hlmBtn variant="secondary" type="button">Export CSV</button>
        </app-page-header>
        <app-metric-strip>
          <app-metric-tile icon="lucideFlag" tone="error" label="Open" [value]="24" sub="6 in the last hour" [loading]="state === 'loading'" />
          <app-metric-tile icon="lucideClock" tone="warning" label="Reviewing" [value]="7" sub="by 3 operators" [loading]="state === 'loading'" />
          <app-metric-tile icon="lucideShieldCheck" tone="success" label="Resolved today" [value]="58" [loading]="state === 'loading'" />
          <app-metric-tile icon="lucideTriangleAlert" tone="info" label="Median wait" [value]="null" sub="Not reported" [loading]="state === 'loading'" />
        </app-metric-strip>
        <app-table-panel>
          <app-panel-bar panelBar>
            <app-search-field label="Search reports" />
            <app-filter-menu label="Status" [options]="statuses" [value]="'OPEN'" [defaultValue]="null" />
            <span class="ms-auto text-[0.8125rem] text-muted-foreground">1–3 of 3</span>
          </app-panel-bar>
          @switch (state) {
            @case ('loading') { <app-skeleton-rows label="Loading reports" /> }
            @case ('empty') { <app-state-message class="min-h-[340px] p-5" kind="empty" title="Queue is clear" description="New reports land here as listeners file them." /> }
            @case ('noResults') { <app-state-message class="min-h-[340px] p-5" kind="noResults" title="No reports match" description="Try another status or clear the search." actionLabel="Clear filters" /> }
            @case ('error') { <app-state-message class="min-h-[340px] p-5" kind="error" title="Reports didn’t load" description="The server didn’t answer." actionLabel="Try again" /> }
            @default {
              <div hlmTableContainer>
                <table hlmTable>
                  <thead hlmTHead><tr hlmTr><th hlmTh>Reported</th><th hlmTh>Reason</th><th hlmTh>Status</th></tr></thead>
                  <tbody hlmTBody>
                    @for (row of rows; track row.what) {
                      <tr hlmTr><td hlmTd class="font-semibold">{{ row.what }}</td><td hlmTd>{{ row.reason }}</td><td hlmTd><span hlmBadge [variant]="row.tone">{{ row.status }}</span></td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        </app-table-panel>
      </div>
    `,
  }),
} satisfies Meta<TablePanel & { state: string }>

export default meta
type Story = StoryObj<TablePanel & { state: string }>

export const Rows: Story = {}
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const NoResults: Story = { args: { state: 'noResults' } }
export const Failed: Story = { args: { state: 'error' } }
