import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  GetStepPostsSwagger,
  RequestStepPostsSwagger,
  RequestTranslationSwagger,
  UpdatePromotionPostSwagger,
  UpdateTranslationSwagger,
} from './decorators'
import {
  type RequestTranslationInput,
  RequestTranslationSchema,
  type UpdatePromotionPostInput,
  UpdatePromotionPostSchema,
  type UpdatePromotionTranslationInput,
  UpdatePromotionTranslationSchema,
} from './dtos'
import {
  PostsViewService,
  RequestPostsService,
  RequestTranslationService,
  UpdatePostService,
  UpdateTranslationService,
} from './posts'

const uuid = new ParseUUIDPipe()

/** Drafts of a POST step and their translations (spec D-7, D-14, D-20). */
@ApiTags('Artist promotion')
@Controller({ path: 'artists/me/releases/:releaseId/promotion/steps/:stepId', version: '1' })
export class PromotionPostsController {
  constructor(
    private readonly views: PostsViewService,
    private readonly requests: RequestPostsService,
    private readonly posts: UpdatePostService,
    private readonly translations: RequestTranslationService,
    private readonly translationEdits: UpdateTranslationService,
  ) {}

  @GetStepPostsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('posts')
  list(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', uuid) releaseId: string,
    @Param('stepId', uuid) stepId: string,
  ) {
    return this.views.view(request.artist.id, releaseId, stepId)
  }

  @RequestStepPostsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('posts')
  write(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', uuid) releaseId: string,
    @Param('stepId', uuid) stepId: string,
  ) {
    return this.requests.request(request.artist.id, releaseId, stepId)
  }

  @UpdatePromotionPostSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch('posts/:postId')
  edit(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', uuid) releaseId: string,
    @Param('stepId', uuid) stepId: string,
    @Param('postId', uuid) postId: string,
    @Body(new ZodValidationPipe(UpdatePromotionPostSchema)) input: UpdatePromotionPostInput,
  ) {
    return this.posts.update(request.artist.id, releaseId, stepId, postId, input)
  }

  @RequestTranslationSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('posts/:postId/translations')
  translate(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', uuid) releaseId: string,
    @Param('stepId', uuid) stepId: string,
    @Param('postId', uuid) postId: string,
    @Body(new ZodValidationPipe(RequestTranslationSchema)) input: RequestTranslationInput,
  ) {
    const artist = request.artist.id
    return this.translations.request(artist, releaseId, stepId, postId, input.language)
  }

  @UpdateTranslationSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch('translations/:translationId')
  editTranslation(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', uuid) releaseId: string,
    @Param('stepId', uuid) stepId: string,
    @Param('translationId', uuid) translationId: string,
    @Body(new ZodValidationPipe(UpdatePromotionTranslationSchema))
    input: UpdatePromotionTranslationInput,
  ) {
    const artist = request.artist.id
    return this.translationEdits.update(artist, releaseId, stepId, translationId, input)
  }
}
