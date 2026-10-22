import { Directive } from '@angular/core'
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field'
import { BrnInput } from '@spartan-ng/brain/input'
import { classes } from '@spartan-ng/helm/utils'

@Directive({
  selector: '[hlmInput]',
  hostDirectives: [
    { directive: BrnInput, inputs: ['id', 'forceInvalid'] },
    BrnFieldControlDescribedBy,
  ],
  host: { 'data-slot': 'input' },
})
export class HlmInput {
  constructor() {
    classes(
      () =>
        'h-[38px] rounded-xl border border-glass-line bg-foreground/5 px-3 py-1 text-base text-foreground transition-[border-color,box-shadow] focus-visible:border-primary/60 focus-visible:ring-primary/20 data-[matches-spartan-invalid=true]:border-error data-[matches-spartan-invalid=true]:ring-error/20 file:h-7 file:text-sm file:font-medium focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    )
  }
}
