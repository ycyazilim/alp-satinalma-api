import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { CompanyDocument } from './company.schema';

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
    ref: 'Company',
    type: mongoose.Schema.Types.ObjectId,
  })
  company: CompanyDocument;

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
