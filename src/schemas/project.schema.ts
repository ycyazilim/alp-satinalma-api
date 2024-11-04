import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Project {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  code: string;

  @Prop({
    type: String,
  })
  chef: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;
}

export type ProjectDocument = Project & Document;

const ProjectSchema = SchemaFactory.createForClass(Project);

export { ProjectSchema };
