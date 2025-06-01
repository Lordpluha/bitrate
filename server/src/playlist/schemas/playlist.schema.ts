import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Comment } from 'src/comment/schemas/comment.schema'
import { Track } from 'src/track/schemas/track.schema'
import { Artist } from 'src/user/schemas/artist.schema'
import { User } from 'src/user/schemas/user.schema'

export type TrackDocument = HydratedDocument<Playlist>

@Schema()
export class Playlist {
	_id: ObjectId

	@Prop()
	name: string

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }, { type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
	authors: Array<Artist | User>

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }] })
	tracks: Track[]

	@Prop()
	cover: string

	@Prop()
	listens: number

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
	comments: Comment[]

	@Prop()
	releaseDate: number
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist)
