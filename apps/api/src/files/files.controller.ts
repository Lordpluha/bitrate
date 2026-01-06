import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { join } from 'path'
import { AuthGuard } from '../auth/auth.guard'
import { FilesService } from './files.service'

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
    @Req() req: Request & { user?: { id: string } },
  ) {
    try {
      // const userId = req.user?.id
      // if (!userId) {
      //   throw new ForbiddenException('Authentication required')
      // }

      // const filePath = await this.filesService.getUserAvatar(filename, userId)
      const filePath = join(process.cwd(), 'public', 'users', 'avatars', filename)

      // if (!filePath) {
      //   throw new NotFoundException('Avatar not found')
      // }

      res.sendFile(filePath)
    } catch {
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
    @Req() req: Request & { user?: { id: string } },
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
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      throw new NotFoundException('Audio file not found')
    }
  }
}
