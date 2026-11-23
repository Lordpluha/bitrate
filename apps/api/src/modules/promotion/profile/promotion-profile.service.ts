import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { PromotionProfileInput } from '../dtos/promotion.dto'
import { PROMOTION_ERRORS } from '../promotion.errors'

const PROFILE_SELECT = {
  goal: true,
  channels: true,
  weeklyHours: true,
  countries: true,
  audience: true,
  voiceWords: true,
  voiceExamples: true,
  updatedAt: true,
} as const

/** The artist's promotion profile (spec D-10); every plan generation reads it. */
@Injectable()
export class PromotionProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(artistId: string) {
    const profile = await this.prisma.artistPromotionProfile.findUnique({
      where: { artistId },
      select: PROFILE_SELECT,
    })
    if (!profile) throw new NotFoundException(PROMOTION_ERRORS.PROFILE_REQUIRED)
    return profile
  }

  /** Replaces the whole profile; the form always sends every field. */
  save(artistId: string, input: PromotionProfileInput) {
    return this.prisma.artistPromotionProfile.upsert({
      where: { artistId },
      create: { artistId, ...input },
      update: input,
      select: PROFILE_SELECT,
    })
  }
}
