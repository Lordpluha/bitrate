import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { User } from './user.schema'

export type TrackDocument = HydratedDocument<Artist>

@Schema()
export class Artist {
	_id: ObjectId

	@Prop({ type: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}})
	user_id: User

	@Prop()
	username: string

	@Prop()
	listens: number

	@Prop()
	verified: boolean

	@Prop()
	email: string

	@Prop()
	avatar: string

	@Prop()
	country: string

	@Prop()
	bio: string

	@Prop()
	followers: number
}

export const ArtistSchema = SchemaFactory.createForClass(Artist)
