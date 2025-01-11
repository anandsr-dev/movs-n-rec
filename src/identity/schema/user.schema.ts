import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as SchemaType, ObjectId } from 'mongoose';
import { GenderEnum, RoleEnum } from 'src/common/constants/general';
import { Genre } from 'src/common/types/genre.type';
import { Gender, Role } from 'src/common/types/user.types';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, _id: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Date, required: true })
  dob: Date;

  @Prop({ type: String, required: true, enum: Object.values(GenderEnum) })
  gender: Gender;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true, enum: Object.values(RoleEnum), default: RoleEnum.USER })
  role: Role;

  @Prop({ type: [String] })
  favoriteGenres?: Genre[]

  @Prop({ type: [{ type: SchemaType.ObjectId, ref: 'Review' }] })
  reviews?: ObjectId[];

  @Prop({ type: String })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
