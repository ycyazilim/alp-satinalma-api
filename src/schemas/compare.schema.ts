import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { DemandDocument } from './demand.schema';

@Schema({
  timestamps: true,
})
export class Compare {
  @Prop({
    ref: 'Demand',
    type: mongoose.Schema.Types.ObjectId,
  })
  demand: DemandDocument;

  @Prop({
    type: Array,
    required: true,
    default: [],
  })
  readUsers: Array<string>;

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
  firms: Array<any>;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  roles: Record<string, any>;

  @Prop({
    type: String,
  })
  note: string;

  @Prop({
    type: String,
  })
  selectedCompanyId: string;

  @Prop({
    type: String,
  })
  projectId: string;
}

export type CompareDocument = Compare & Document;

const CompareScheme = SchemaFactory.createForClass(Compare);

export { CompareScheme };
