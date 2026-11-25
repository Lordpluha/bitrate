import { Component, computed, effect, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListSupportConversationsUseCase } from '@application/support'
import { DEFAULT_PAGE_SIZE } from '@domain/shared'
import type {
  SupportAudience,
  SupportChannel,
  SupportInboxFilter,
  SupportInboxItem,
  SupportTicketStatus,
} from '@domain/support'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight } from '@ng-icons/lucide'
import {
  CollectionStatus,
  type FilterOption,
  FilterMenu,
  PageHeader,
  Paginator,
  PanelBar,
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe } from '@presentation/pipes'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '@spartan-ng/helm/table'
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  STATE_BADGE,
  STATE_LABEL,
  TICKET_STATUS_LABEL,
} from './support-labels'
import {
  SUPPORT_AUDIENCES,
  SUPPORT_CHANNELS,
  SUPPORT_TICKET_STATUSES,
  supportInboxQueryCodec,
} from './support-inbox.query'

const LOAD_ERROR = 'support.error.load'

/** The operators' support inbox (#573): conversations the assistant handed to a person. */
@Component({
  selector: 'app-support-inbox',
  imports: [
    CollectionStatus,
    ElapsedPipe,
    FilterMenu,
    HlmBadgeImports,
    HlmTableImports,
    NgIcon,
    PageHeader,
    Paginator,
    PanelBar,
    RouterLink,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  providers: [provideIcons({ lucideChevronRight })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './support-inbox.html',
})
export class SupportInbox {
  private readonly listConversations = inject(ListSupportConversationsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly stateLabel = STATE_LABEL
  protected readonly stateBadge = STATE_BADGE
  protected readonly channelLabel = CHANNEL_LABEL
  protected readonly audienceLabel = AUDIENCE_LABEL
  protected readonly query = bindQueryState({ codec: supportInboxQueryCodec })

  private readonly filter = (): SupportInboxFilter => {
    const { status, channel, audience } = this.query.state()
    return {
      status: status ?? undefined,
      channel: channel ?? undefined,
      audience: audience ?? undefined,
    }
  }

  protected readonly collection = createCollection<SupportInboxItem>({
    errorMessage: LOAD_ERROR,
    load: (page) => this.listConversations.execute({ page, filter: this.filter() }),
  })

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })

  protected readonly statusOptions = computed<FilterOption<SupportTicketStatus | null>[]>(() => [
    { value: null, label: this.t('support.status.all') },
    ...SUPPORT_TICKET_STATUSES.map((status) => ({
      value: status,
      label: this.t(TICKET_STATUS_LABEL[status]),
    })),
  ])

  protected readonly channelOptions = computed<FilterOption<SupportChannel | null>[]>(() => [
    { value: null, label: this.t('support.channel.all') },
    ...SUPPORT_CHANNELS.map((channel) => ({
      value: channel,
      label: this.t(CHANNEL_LABEL[channel]),
    })),
  ])

  protected readonly audienceOptions = computed<FilterOption<SupportAudience | null>[]>(() => [
    { value: null, label: this.t('support.audience.all') },
    ...SUPPORT_AUDIENCES.map((audience) => ({
      value: audience,
      label: this.t(AUDIENCE_LABEL[audience]),
    })),
  ])

  /** True once the operator moved off the default view (open tickets from everywhere). */
  protected readonly narrowed = computed(() => {
    const { status, channel, audience } = this.query.state()
    return status !== 'open' || channel !== null || audience !== null
  })

  /** "1–20 of 64", or nothing while there is nothing to count. */
  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    const to = from + this.collection.items().length - 1
    return { from, to, total }
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
  }

  protected setStatus(status: SupportTicketStatus | null): void {
    this.query.patch({ status, page: 1 })
  }

  protected setChannel(channel: SupportChannel | null): void {
    this.query.patch({ channel, page: 1 })
  }

  protected setAudience(audience: SupportAudience | null): void {
    this.query.patch({ audience, page: 1 })
  }

  protected clearFilters(): void {
    this.query.patch({ status: 'open', channel: null, audience: null, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
  }

  private t(key: string): string {
    return this.transloco.translate(key, {}, this.locale())
  }
}
