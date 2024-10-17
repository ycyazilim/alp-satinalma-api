import { Prop, Schema } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';

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
  })
  demandItems: Array<any>;
}
