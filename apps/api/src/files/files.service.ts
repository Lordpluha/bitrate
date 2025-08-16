import {
  Injectable,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common'
import { join } from 'path'
import { existsSync } from 'fs'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAvatar(
    filename: string,
    userId: string
  ): Promise<string | null> {
    // Проверяем, что файл принадлежит пользователю или доступен публично
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new ForbiddenException('Access denied')
    }

    const filePath = join(process.cwd(), 'public', 'users', 'avatars', filename)

    if (!existsSync(filePath)) {
      return null
    }

    // Можно добавить дополнительную логику проверки доступа
    // Например, проверить, что аватарка принадлежит пользователю или публична

    return filePath
  }

  async getAudioFile(filename: string, userId: string): Promise<string | null> {
    // Проверяем права доступа к аудиофайлу
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new ForbiddenException('Access denied')
    }

    // Проверяем, что пользователь имеет право на доступ к этому аудиофайлу
    // Например, это его собственный трек или он имеет подписку
    const track = await this.prisma.track.findFirst({
      where: {
        audioUrl: {
          contains: filename
        }
      },
      include: {
        artist: true
      }
    })

    if (!track) {
      throw new NotFoundException('Audio file not found')
    }

    // Проверяем права доступа
    // Пока что разрешаем доступ всем авторизованным пользователям
    // В будущем здесь можно добавить логику проверки подписки или публичности трека

    const filePath = join(process.cwd(), 'public', 'audio', filename)

    if (!existsSync(filePath)) {
      return null
    }

    return filePath
  }
}
