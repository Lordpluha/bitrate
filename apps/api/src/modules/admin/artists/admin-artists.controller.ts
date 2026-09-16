import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminArtistsService } from './admin-artists.service'
import {
  DeleteArtistSwagger,
  GetArtistSwagger,
  ListArtistsSwagger,
  UpdateArtistVerificationSwagger,
} from './decorators'
import {
  type ListAdminArtistsQueryDto,
  ListAdminArtistsQuerySchema,
  type UpdateArtistVerificationDto,
  UpdateArtistVerificationSchema,
} from './dtos'

/** Operator-facing artist directory. */
@ApiTags('Admin Artists')
@AdminAuth()
@Controller({ path: 'admin/artists', version: '1' })
export class AdminArtistsController {
  constructor(private readonly artists: AdminArtistsService) {}

  /** Runs the list artists operation. */
  @RequirePermission('artists:read')
  @ListArtistsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminArtistsQuerySchema)) query: ListAdminArtistsQueryDto) {
    return this.artists.findAll(query)
  }

  /** Runs the get artist operation. */
  @RequirePermission('artists:read')
  @GetArtistSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.artists.findById(id)
  }

  /** Runs the update verification operation. */
  @RequirePermission('artists:verify')
  @UpdateArtistVerificationSwagger()
  @Patch(':id/verification')
  updateVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateArtistVerificationSchema)) dto: UpdateArtistVerificationDto,
  ) {
    return this.artists.updateVerification(id, dto)
  }

  /** Runs the soft-delete operation. */
  @RequirePermission('artists:delete')
  @DeleteArtistSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artists.softDelete(id)
  }
}
