import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDto } from 'src/dtos/create-role.dto';
import { Role, RoleDocument } from 'src/schemas/role.schema';
import { UpdateRoleDto } from '../../dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = new this.roleModel({
      ...createRoleDto,
    });
    console.log(role);
    return await role.save();
  }

  async update(updateRoleDto: UpdateRoleDto) {
    return this.roleModel.findByIdAndUpdate(
      updateRoleDto.id,
      {
        ...updateRoleDto,
      },
      { new: true },
    );
  }
  async findAll(page: number) {
    const count = await this.roleModel.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.roleModel
      .find({ isDeleted: false })
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }
  async detail(id: string) {
    return this.roleModel.findById(id);
  }
  async filter(name: string, page: number, startDate: string, endDate: string) {
    const query: any = {
      role: { $regex: name, $options: 'i' },
      isDeleted: false,
    };

    if (startDate != '') {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }

    if (endDate != '') {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    const count = await this.roleModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.roleModel
      .find(query)
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  remove(id: string) {
    return this.roleModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }
}
