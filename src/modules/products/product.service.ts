import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import {
  ProductOffer,
  ProductOfferDocument,
} from '../../schemas/product.offer.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductOffer.name)
    private productOfferModel: Model<ProductOfferDocument>,
  ) {}

  async findAll(page: number) {
    const count = await this.productModel.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.productModel
      .find()
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }
  async findAllOffer(page: number, id: string) {
    const findProduct = await this.productModel.findById(id);
    const count = await this.productOfferModel
      .countDocuments({
        product: findProduct,
      })
      .exec();
    console.log(count);
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.productOfferModel
      .find({
        product: findProduct,
      })
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }
  async detail(id: string) {
    return this.productModel.findById(id);
  }

  async filter(name: string, page: number, startDate: string, endDate: string) {
    const query: any = {
      name: { $regex: name, $options: 'i' },
      isDeleted: false,
    };
    if (startDate != '') {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }

    if (endDate != '') {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    const count = await this.productModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.productModel
      .find(query)
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  async addNewOffer(firms: any) {
    for (const i of firms) {
      for (const l of i.offers) {
        const product = l.product;
        const oldProduct = await this.productModel.findOne({
          name: product.name,
        });

        if (oldProduct) {
          const model = await this.productOfferModel.findOne({
            product: oldProduct._id,
            firmName: i.name,
            brand: l.brand,
          });
          if (model) {
            model.unitPrice = l.unitPrice ?? 0.0;
            model.brand = l.brand ?? '';
            model.payment = l.selectedPayment ?? 'tl';
            await model.save();
          } else {
            await this.productOfferModel.create({
              firmName: i.name ?? '',
              brand: l.brand ?? '',
              unitPrice: l.unitPrice ?? 0.0,
              payment: l.selectedPayment ?? 'tl',
              crateDate: new Date().toISOString(),
              product: oldProduct._id,
            });
          }
        } else {
          const newProduct = await this.productModel.create({
            name: product.name,
          });
          console.log(l);
          await this.productOfferModel.create({
            firmName: i.name ?? '',
            brand: l.brand ?? '',
            unitPrice: l.unitPrice ?? 0.0,
            payment: l.selectedPayment ?? 'tl',
            crateDate: new Date().toISOString(),
            product: newProduct._id,
          });
        }
      }
    }
  }
}
