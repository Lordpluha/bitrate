import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Comment } from 'src/comment/schemas/comment.schema'
import { Track } from 'src/track/schemas/track.schema'
import { Artist } from 'src/user/schemas/artist.schema'

export type TrackDocument = HydratedDocument<Album>

@Schema()
export class Album {
	_id: ObjectId

	@Prop()
	name: string

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }] })
	artists: Artist[]

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

export const AlbumSchema = SchemaFactory.createForClass(Album)
