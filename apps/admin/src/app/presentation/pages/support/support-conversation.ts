import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { SessionStore } from '@application/session'
import {
  GetSupportConversationUseCase,
  ReplyToSupportConversationUseCase,
  ResolveSupportConversationUseCase,
} from '@application/support'
import { canResolve, MAX_SUPPORT_REPLY_CHARS, type SupportConversation } from '@domain/support'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideCheck, lucideMessagesSquare, lucideSend, lucideTicket } from '@ng-icons/lucide'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  ROLE_LABEL,
  STATE_BADGE,
  STATE_LABEL,
  TICKET_STATUS_LABEL,
} from './support-labels'
import { supportReplySchema } from './support-reply.schema'

const ERROR: Record<'load' | 'reply' | 'resolve', string> = {
  load: 'supportConversation.error.load',
  reply: 'supportConversation.error.reply',
  resolve: 'supportConversation.error.resolve',
}

/** One handed-off conversation: its history, the ticket, and the operator's reply (#573). */
@Component({
  selector: 'app-support-conversation',
  imports: [
    ElapsedPipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmLabelImports,
    KvRow,
    LocalizedDatePipe,
    NgIcon,
    PageHeader,
    ReactiveFormsModule,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCheck, lucideMessagesSquare, lucideSend, lucideTicket })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './support-conversation.html',
})
export class SupportConversationPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getConversation = inject(GetSupportConversationUseCase)
  private readonly replyTo = inject(ReplyToSupportConversationUseCase)
  private readonly resolveConversation = inject(ResolveSupportConversationUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canReply = inject(SessionStore).can('support:reply')
  protected readonly conversationId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly stateLabel = STATE_LABEL
  protected readonly stateBadge = STATE_BADGE
  protected readonly ticketStatusLabel = TICKET_STATUS_LABEL
  protected readonly roleLabel = ROLE_LABEL
  protected readonly replyMax = MAX_SUPPORT_REPLY_CHARS

  private readonly record = createDetailResource({
    load: () => this.getConversation.execute(this.conversationId),
    errorMessage: ERROR.load,
  })

  protected readonly conversation = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly pending = signal(false)
  protected readonly confirmingResolve = signal(false)

  protected readonly form = new FormGroup(
    { text: new FormControl('', { nonNullable: true }) },
    { validators: zodValidator(supportReplySchema) },
  )
  private readonly draft = toSignal(this.form.controls.text.valueChanges, { initialValue: '' })
  protected readonly draftLength = computed(() => this.draft().length)

  protected readonly back = computed(() => ({ link: '/support', label: this.t('support.title') }))

  protected readonly failureText = computed(() => {
    const key = this.failure()
    return key === null ? null : this.t(key)
  })

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
    void this.record.reload()
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase()
  }

  protected subtitle(conversation: SupportConversation, age: string): string {
    return this.t('supportConversation.subtitle', {
      channel: this.t(CHANNEL_LABEL[conversation.channel]),
      audience: this.t(AUDIENCE_LABEL[conversation.audience]),
      age,
    })
  }

  protected resolvable(conversation: SupportConversation): boolean {
    return canResolve(conversation)
  }

  /** The reply's error as a transloco key, once the operator has touched the field. */
  protected replyError(): string | null {
    const control = this.form.controls.text
    return control.touched ? zodErrorMessage(control) : null
  }

  protected async sendReply(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.pending() || !this.canReply()) return
    await this.run(ERROR.reply, async () => {
      const updated = await this.replyTo.execute({
        id: this.conversationId,
        text: this.form.controls.text.value,
      })
      this.form.reset({ text: '' })
      return updated
    })
  }

  protected dismissResolve(): void {
    if (!this.pending()) this.confirmingResolve.set(false)
  }

  protected async confirmResolve(): Promise<void> {
    const current = this.conversation()
    if (!current) return
    await this.run(ERROR.resolve, () => this.resolveConversation.execute(current))
    this.confirmingResolve.set(false)
  }

  private async run(errorKey: string, action: () => Promise<SupportConversation>): Promise<void> {
    this.pending.set(true)
    this.failure.set(null)
    try {
      this.record.set(await action())
    } catch {
      this.failure.set(errorKey)
    } finally {
      this.pending.set(false)
    }
  }

  private t(key: string, params: Record<string, unknown> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
