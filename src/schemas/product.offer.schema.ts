import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ProductDocument } from './product.schema';

@Schema({
  timestamps: true,
})
export class ProductOffer {
  @Prop({
    type: String,
    required: true,
  })
  firmName: string;

  @Prop({
    type: String,
    required: true,
  })
  brand: string;

  @Prop({
    type: String,
    required: true,
  })
  payment: string;

  @Prop({
    type: String,
    required: true,
  })
  unitPrice: number;

  @Prop({
    type: Date,
    required: true,
  })
  crateDate: any;

  @Prop({
    ref: 'Product',
    type: mongoose.Schema.Types.ObjectId,
  })
  product: ProductDocument;
}

export type ProductOfferDocument = ProductOffer & Document;

const ProductOfferSchema = SchemaFactory.createForClass(ProductOffer);

export { ProductOfferSchema };
