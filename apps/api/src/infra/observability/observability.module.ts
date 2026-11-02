import { Global, Module } from '@nestjs/common'
import { MetricsService } from './metrics.service'

/** One metrics registry for the whole API, injectable from any module (e.g. playback sessions). */
@Global()
@Module({
  providers: [MetricsService],
  exports: [MetricsService],
})
export class ObservabilityModule {}
