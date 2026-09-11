import { AdminAuth, StaffRoles } from '@modules/admin-auth'
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
@AdminAuth('ADMIN', 'MODERATOR')
@Controller({ path: 'admin/artists', version: '1' })
export class AdminArtistsController {
  constructor(private readonly artists: AdminArtistsService) {}

  /** Runs the list artists operation. Available to any staff role. */
  @ListArtistsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminArtistsQuerySchema)) query: ListAdminArtistsQueryDto) {
    return this.artists.findAll(query)
  }

  /** Runs the get artist operation. Available to any staff role. */
  @GetArtistSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.artists.findById(id)
  }

  /** Runs the update verification operation. Requires the ADMIN role. */
  @StaffRoles('ADMIN')
  @UpdateArtistVerificationSwagger()
  @Patch(':id/verification')
  updateVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateArtistVerificationSchema)) dto: UpdateArtistVerificationDto,
  ) {
    return this.artists.updateVerification(id, dto)
  }

  /** Runs the soft-delete operation. Requires the ADMIN role. */
  @StaffRoles('ADMIN')
  @DeleteArtistSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artists.softDelete(id)
  }
}
