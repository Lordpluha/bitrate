import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, ObjectId } from 'mongoose'

export type TrackDocument = HydratedDocument<User>

@Schema()
export class User {
	_id: ObjectId

	@Prop()
	username: string

	@Prop()
	password: string

	@Prop()
	followers: number

	@Prop()
	email: string

	@Prop()
	avatar: string

	@Prop()
	country: string

	@Prop()
	bio: string

	@Prop()
	followed: number
}

export const UserSchema = SchemaFactory.createForClass(User)
