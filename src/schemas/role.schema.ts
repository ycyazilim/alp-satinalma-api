import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Role {
  @Prop({
    type: String,
  })
  role: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isObserver: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;
}

export type RoleDocument = Role & Document;

const RoleSchema = SchemaFactory.createForClass(Role);

export { RoleSchema };
