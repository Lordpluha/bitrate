import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Album } from 'src/album/schemas/album.schema'
import { Playlist } from 'src/playlist/schemas/playlist.schema'
import { User } from 'src/user/schemas/user.schema'
import { Track } from '../../track/schemas/track.schema'

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class Comment {
	_id: ObjectId

	@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
	user_id: User

	@Prop()
	username: string

	@Prop()
	text: string
	// { type: mongoose.Schema.Types.ObjectId, ref: 'Track'}
	@Prop()
	target: Track | Album | Playlist

	@Prop()
	publicationDate: number
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
