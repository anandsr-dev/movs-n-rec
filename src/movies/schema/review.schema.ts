import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, _id: true })
export class Review {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Movie', index: true })
    movieId: MongooseSchema.Types.ObjectId;

    @Prop({ type: Number, required: true })
    rating: number;

    @Prop({ type: String })
    comment?: string;
};

export const ReviewSchema = SchemaFactory.createForClass(Review);