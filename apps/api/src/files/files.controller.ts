import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Req
} from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthGuard } from '../auth/auth.guard'
import { FilesService as FilesService } from './files.service'
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { join } from 'path'

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // @UseGuards(AuthGuard)
  @Get('users/avatars/:filename')
  @ApiOperation({ summary: 'Get user avatar' })
  @ApiParam({ name: 'filename', description: 'Avatar filename' })
  @ApiResponse({ status: 200, description: 'Avatar file' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  getUserAvatar(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req: Request & { user?: { id: string } }
  ) {
    try {
      // const userId = req.user?.id
      // if (!userId) {
      //   throw new ForbiddenException('Authentication required')
      // }

      // const filePath = await this.filesService.getUserAvatar(filename, userId)
      const filePath = join(
        process.cwd(),
        'public',
        'users',
        'avatars',
        filename
      )

      // if (!filePath) {
      //   throw new NotFoundException('Avatar not found')
      // }

      res.sendFile(filePath)
    } catch (error) {
      // if (error instanceof NotFoundException || error instanceof ForbiddenException) {
      //   throw error
      // }
      throw new NotFoundException('Avatar not found')
    }
  }

  @UseGuards(AuthGuard)
  @Get('audio/:filename')
  @ApiOperation({ summary: 'Get audio file' })
  @ApiParam({ name: 'filename', description: 'Audio filename' })
  @ApiResponse({ status: 200, description: 'Audio file' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Audio file not found' })
  async getAudioFile(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req: Request & { user?: { id: string } }
  ) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new ForbiddenException('Authentication required')
      }

      const filePath = await this.filesService.getAudioFile(filename, userId)

      if (!filePath) {
        throw new NotFoundException('Audio file not found')
      }

      res.sendFile(filePath)
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error
      }
      throw new NotFoundException('Audio file not found')
    }
  }
}
