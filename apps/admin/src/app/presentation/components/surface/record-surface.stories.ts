import { provideRouter, withDisabledInitialNavigation } from '@angular/router'
import { provideIcons } from '@ng-icons/core'
import { lucideFileText, lucideHistory, lucideMusic } from '@ng-icons/lucide'
import { HlmBadge } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { applicationConfig, type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { KvRow } from './kv-row'
import { PageHeader } from './page-header'
import { Skeleton } from './skeleton'
import { StateMessage } from './state-message'
import { Tile, TileGrid } from './tile'

/** A record screen as the design draws it: header with back pill and status, then a bento. */
const meta = {
  title: 'Surface/Record screen',
  component: Tile,
  tags: ['autodocs'],
  decorators: [
    // No initial navigation: no route matches the iframe's path, and a failed navigation resets
    // the document URL — which, published under /admin/, sends every lazy story chunk to the root.
    applicationConfig({ providers: [provideRouter([], withDisabledInitialNavigation())] }),
    moduleMetadata({
      imports: [
        HlmBadge,
        HlmButtonImports,
        KvRow,
        PageHeader,
        Skeleton,
        StateMessage,
        Tile,
        TileGrid,
      ],
      providers: [provideIcons({ lucideFileText, lucideHistory, lucideMusic })],
    }),
  ],
  parameters: { layout: 'padded' },
  render: () => ({
    template: `
      <div class="flex flex-col gap-5">
        <app-page-header
          eyebrow="Report R-1042"
          title="Night Drive"
          subtitle="Filed by a listener 12 minutes ago."
          [back]="{ link: '/moderation', label: 'Moderation' }"
        >
          <span headerStatus hlmBadge variant="destructive">Open</span>
          <button headerActions hlmBtn variant="secondary" type="button">Reject</button>
          <button headerActions hlmBtn type="button">Resolve</button>
        </app-page-header>
        <app-tile-grid>
          <app-tile icon="lucideMusic" title="Reported track" meta="Kavinsky · OutRun" [span]="2">
            <app-kv-row label="ID">TR-88213</app-kv-row>
            <app-kv-row label="Uploaded">12 Oct 2026</app-kv-row>
            <app-kv-row label="Status"><span hlmBadge variant="success">Published</span></app-kv-row>
          </app-tile>
          <app-tile icon="lucideFileText" title="Reason" meta="Copyright" [span]="2">
            <p class="text-sm text-muted-foreground">“This is my recording uploaded without permission.”</p>
          </app-tile>
          <app-tile icon="lucideHistory" title="History" meta="Nothing yet" [span]="4">
            <app-state-message kind="info" title="No decisions yet" description="Decisions on this report will appear here." [compact]="true" />
          </app-tile>
        </app-tile-grid>
      </div>
    `,
  }),
} satisfies Meta<Tile>

export default meta
type Story = StoryObj<Tile>

export const Record: Story = {}

export const Loading: Story = {
  render: () => ({
    template: `
      <app-tile-grid>
        @for (tile of [1, 2, 3]; track tile) {
          <app-tile title="Loading" [span]="tile === 3 ? 4 : 2">
            <app-skeleton class="h-3.5 w-full" />
            <app-skeleton class="h-3.5 w-4/5" />
            <app-skeleton class="h-3.5 w-3/5" />
          </app-tile>
        }
      </app-tile-grid>
    `,
  }),
}
