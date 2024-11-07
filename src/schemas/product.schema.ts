import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name: string;
}

export type ProductDocument = Product & Document;

const ProductSchema = SchemaFactory.createForClass(Product);

export { ProductSchema };
