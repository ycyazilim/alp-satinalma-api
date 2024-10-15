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
}

export type RoleDocument = Role & Document;

const RoleSchema = SchemaFactory.createForClass(Role);

export { RoleSchema };
