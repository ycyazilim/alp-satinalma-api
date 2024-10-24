import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from './user.schema';

import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Demand {
  @Prop({
    type: String,
    required: true,
  })
  documentType: string;

  @Prop({
    type: String,
    required: true,
  })
  projectName: string;

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
  firms: Array<any>;

  // Use Mixed to allow any arbitrary fields
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  roles: Record<string, any>;

  @Prop({
    type: String,
  })
  notes: string;
}

export type DemandDocument = Demand & Document;

const DemandSchema = SchemaFactory.createForClass(Demand);

export { DemandSchema };
