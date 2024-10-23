import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { RoleDocument } from './role.schema';

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
  password: string;

  @Prop({
    ref: 'Roles',
    type: mongoose.Schema.Types.ObjectId,
  })
  role: RoleDocument;
}

export type UserDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
