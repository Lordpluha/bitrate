import { Controller } from '@nestjs/common'
import { ApiExtraModels } from '@nestjs/swagger'
import { TrackEntity } from './entities'

@ApiExtraModels(TrackEntity)
@Controller('tracks')
export class TracksController {}
