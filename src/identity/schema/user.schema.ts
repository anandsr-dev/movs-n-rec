import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as SchemaType } from 'mongoose';
import { GenderEnum, RoleEnum } from 'src/common/constants';
import { Gender, Role } from 'src/common/types/user.types';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, _id: true }) // Automatically adds createdAt and updatedAt fields
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true, enum: Object.values(GenderEnum) })
  gender: Gender;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true, enum: Object.values(RoleEnum), default: RoleEnum.USER })
  role: Role;

  @Prop({ type: [{ type: SchemaType.ObjectId, ref: 'Review' }] })
  reviews: string[];

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
