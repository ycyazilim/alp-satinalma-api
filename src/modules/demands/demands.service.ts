import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { Demand, DemandDocument } from 'src/schemas/demand.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class DemandsService {
  constructor(
    @InjectModel(Demand.name) private demandModel: Model<DemandDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createDemand(
    createDemandDto: CreateDemandDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const {
      documentType,
      projectName,
      projectCode,
      constructorChef,
      demandItems,
    } = createDemandDto;

    const demand = new this.demandModel({
      documentType,
      projectName,
      projectCode,
      demandRequester: findUser._id,
      constructorChef,
      demandItems,
    });

    return demand.save();
  }
}
