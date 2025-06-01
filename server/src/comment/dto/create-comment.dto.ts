import mongoose from 'mongoose'

export class CreateCommentDto {
	readonly username: string
	readonly text: string
	readonly trackId: mongoose.Types.ObjectId
}