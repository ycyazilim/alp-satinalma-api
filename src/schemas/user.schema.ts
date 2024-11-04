import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { ProjectDocument } from './project.schema';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
  })
  nameSurname: string;

  @Prop({
    type: String,
  })
  password: string;

  @Prop({
    type: String,
  })
  role: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isAdmin: boolean;

  @Prop({
    type: String,
  })
  oneSignalId: string;
}

export type UserDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
