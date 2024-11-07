import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from './user.schema';

import * as mongoose from 'mongoose';
import { ProjectDocument } from './project.schema';

@Schema({
  timestamps: true,
})
export class Demand {
  @Prop({
    ref: 'Project',
    type: mongoose.Schema.Types.ObjectId,
  })
  project: ProjectDocument;

  @Prop({
    type: String,
    required: true,
  })
  projectName: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: Array,
    required: true,
    default: [],
  })
  readUsers: Array<string>;

  @Prop({
    type: String,
    required: true,
  })
  projectCode: string;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  demandRequester: UserDocument;

  @Prop({
    type: String,
    required: true,
  })
  constructorChef: string;

  @Prop({
    type: Array,
    required: true,
    default: [],
  })
  demandItems: Array<any>;

  @Prop({
    type: Array,
    required: true,
    default: [],
  })
  files: Array<any>;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  roles: Record<string, any>;
}

export type DemandDocument = Demand & Document;

const DemandSchema = SchemaFactory.createForClass(Demand);

export { DemandSchema };
