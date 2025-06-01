import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ObjectId } from 'mongoose'

import { TrackService } from './track.service'

import { CreateCommentDto } from '../comment/dto/create-comment.dto'
import { CreateTrackDto } from './dto/create-track.dto'

@Controller('/tracks')
export class TrackController {
	constructor(private trackService: TrackService) {}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'picture', maxCount: 1 },
			{ name: 'audio', maxCount: 1 },
		]),
	)
	create(
		@UploadedFiles()
		files: {
			picture?: Express.Multer.File[]
			audio: Express.Multer.File[]
		},
		@Body() dto: CreateTrackDto,
	) {
		return this.trackService.create(dto, files.picture[0], files.audio[0])
	}

	@Get()
	getAll(@Query('count') count: number, @Query('offset') offset: number) {
		return this.trackService.getAll(count, offset)
	}

	@Get('/search')
	search(@Query('query') query: string) {
		return this.trackService.search(query)
	}

	@Get(':id')
	getOne(@Param('id') id: ObjectId) {
		return this.trackService.getOne(id)
	}

	@Delete(':id')
	delete(@Param('id') id: ObjectId) {
		return this.trackService.delete(id)
	}

	@Post('/comment')
	addComment(@Body() dto: CreateCommentDto) {
		return this.trackService.addComment(dto)
	}

	@Post('/listen/:id')
	listen(@Param('id') id: ObjectId) {
		return this.trackService.listen(id)
	}
}