import { Controller, ForbiddenException, Get, Param, Req, Res, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthGuard } from '../auth/auth.guard'
import { FilesService } from './files.service'

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Private endpoint for streaming audio tracks
   * Requires authentication
   */
  @UseGuards(AuthGuard)
  @Get('tracks/:filename')
  @ApiOperation({ summary: 'Get private audio track (requires auth)' })
  @ApiParam({ name: 'filename', description: 'Audio filename' })
  @ApiResponse({ status: 200, description: 'Audio file' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Audio file not found' })
  async getPrivateTrack(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id
    if (!userId) {
      throw new ForbiddenException('Authentication required')
    }

    const filePath = await this.filesService.getPrivateTrackPath(filename, userId)
    res.sendFile(filePath)
  }
}
