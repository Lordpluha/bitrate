import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {}
