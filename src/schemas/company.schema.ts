import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Company {
  @Prop({
    type: String,
  })
  vkn: string;

  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;
}

export type CompanyDocument = Company & Document;

const CompanySchema = SchemaFactory.createForClass(Company);

export { CompanySchema };
