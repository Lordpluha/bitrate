import { PrismaService } from '@infra/prisma/prisma.service'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { existsSync } from 'fs'
import { join } from 'path'

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get path to private audio file (requires authentication)
   */
  async getPrivateTrackPath(filename: string, userId: string): Promise<string> {
    // Verify user is authenticated
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new ForbiddenException('Access denied')
    }

    // Find track and verify access
    const track = await this.prisma.track.findFirst({
      where: {
        audioUrl: {
          contains: filename,
        },
      },
    })

    if (!track) {
      throw new NotFoundException('Track not found')
    }

    // Build file path
    const filePath = join(process.cwd(), 'storage', 'private', 'tracks', filename)

    if (!existsSync(filePath)) {
      throw new NotFoundException('Audio file not found on disk')
    }

    return filePath
  }
}
