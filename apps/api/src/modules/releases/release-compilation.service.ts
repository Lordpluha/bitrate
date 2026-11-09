import { PrismaService } from '@infra/prisma/prisma.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import {
  assertDistinctCompilationAudio,
  compilationSourceWhere,
  lockCompilationSources,
} from './compilation-source'
import type { AddCompilationTracksDto, CompilationCatalogueDto } from './dtos/compilation.dto'
import { RELEASE_ERRORS } from './errors'
import { RELEASE_SUMMARY_SELECT } from './orm'
import { lockOwnedDraft } from './release-draft-lock'

const LIMIT = 20

@Injectable()
export class ReleaseCompilationService {
  constructor(private readonly prisma: PrismaService) {}

  async catalogue(ownerArtistId: string, id: string, input: CompilationCatalogueDto) {
    const release = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: { id: true },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const where = {
      ...compilationSourceWhere(ownerArtistId),
      compilationDrafts: { none: { releaseId: id, deletedAt: null } },
      ...(input.search ? { title: { contains: input.search, mode: 'insensitive' as const } } : {}),
    }
    const total = await this.prisma.track.count({ where })
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / LIMIT)))
    const data = await this.prisma.track.findMany({
      where,
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      select: { id: true, title: true, duration: true, isrc: true, cover: true },
    })
    return { data, total, page, limit: LIMIT }
  }

  add(ownerArtistId: string, id: string, input: AddCompilationTracksDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        accuracyConfirmedAt: null,
      })
      const active = await tx.artistTrackDraft.findMany({
        where: { releaseId: id, deletedAt: null },
        select: { sourceTrackId: true, position: true },
      })
      if (active.some((track) => !track.sourceTrackId))
        throw new ConflictException(RELEASE_ERRORS.COMPILATION_ONLY_CATALOGUE)
      if (active.length + input.trackIds.length > 50)
        throw new ConflictException(RELEASE_ERRORS.COMPILATION_LIMIT)
      if (active.some((track) => input.trackIds.includes(track.sourceTrackId!)))
        throw new ConflictException(RELEASE_ERRORS.COMPILATION_DUPLICATE)
      await lockCompilationSources(tx, ownerArtistId, input.trackIds)
      await assertDistinctCompilationAudio(tx, ownerArtistId, [
        ...active.flatMap((track) => (track.sourceTrackId ? [track.sourceTrackId] : [])),
        ...input.trackIds,
      ])
      const sources = await tx.track.findMany({
        where: { ...compilationSourceWhere(ownerArtistId), id: { in: input.trackIds } },
        select: { id: true, title: true, duration: true },
      })
      if (sources.length !== input.trackIds.length)
        throw new ConflictException(RELEASE_ERRORS.COMPILATION_SOURCE_UNAVAILABLE)
      const byId = new Map(sources.map((track) => [track.id, track]))
      const start = Math.max(-1, ...active.map((track) => track.position)) + 1
      for (const [index, sourceTrackId] of input.trackIds.entries()) {
        const source = byId.get(sourceTrackId)!
        await tx.artistTrackDraft.create({
          data: {
            ownerArtistId,
            releaseId: id,
            sourceTrackId,
            title: source.title,
            duration: source.duration,
            status: 'READY',
            position: start + index,
          },
        })
      }
      return {
        release: await tx.release.update({
          where: { id },
          data: { type: 'COMPILATION', updatedAt: release.updatedAt },
          select: RELEASE_SUMMARY_SELECT,
        }),
        trackIds: input.trackIds,
      }
    })
  }
}
