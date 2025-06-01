import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Album } from 'src/album/schemas/album.schema'
import { Artist } from 'src/user/schemas/artist.schema'
import { Comment } from '../../comment/schemas/comment.schema'

export type TrackDocument = HydratedDocument<Track>

@Schema()
export class Track {
	// @Prop({type: mongoose.Schema.Types.ObjectId})
	_id: ObjectId

	@Prop()
	name: string

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }] })
	artists: Artist[]

	@Prop()
	text: string

	@Prop()
	listens: number

	@Prop()
	cover: string

	@Prop()
	audio: string

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
	comments: Comment[]

	@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' } })
	album: Album

	@Prop()
	duration: number

	@Prop()
	releaseDate: number
}


export const TrackSchema = SchemaFactory.createForClass(Track)
