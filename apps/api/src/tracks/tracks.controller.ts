import { Controller, Get, Param } from '@nestjs/common'
import { ApiExtraModels } from '@nestjs/swagger'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'

@ApiExtraModels(TrackEntity)
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.tracksService.getTrackById(id)
  }
}
