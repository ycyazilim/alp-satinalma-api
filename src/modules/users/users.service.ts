import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/dtos/update-user.dto';
import { Role, RoleDocument } from '../../schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async findAll(page: number) {
    const count = await this.userModel.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.userModel
      .find({ isDeleted: false })
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  async filter(name: string, page: number, startDate: string, endDate: string) {
    const query: any = {
      nameSurname: { $regex: name, $options: 'i' },
      isDeleted: false,
    };
    if (startDate != '') {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }

    if (endDate != '') {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    const count = await this.userModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.userModel
      .find(query)
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  getSingleUser(id: string) {
    return this.userModel.findById(id);
  }

  async createUser(createUserDto: CreateUserDto) {
    const findUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (findUser) {
      return 'User already exists';
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const findRole = await this.roleModel.findById(createUserDto.role);
    const newUser = new this.userModel({
      nameSurname: createUserDto.nameSurname,
      email: createUserDto.email,
      password: hashedPassword,
      role: findRole.role,
    });

    await newUser.save();

    return newUser;
  }

  delete(id: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const userModel = await this.userModel.findById(updateUserDto.id);
    if (updateUserDto.password != '') {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 12);
      userModel.password = hashedPassword;
    }
    userModel.email = updateUserDto.email;
    userModel.nameSurname = updateUserDto.nameSurname;
    const findRole = await this.roleModel.findById(updateUserDto.role);

    userModel.role = findRole.role;
    return this.userModel.findByIdAndUpdate(
      updateUserDto.id,
      { ...userModel },
      {
        new: true,
      },
    );
  }
}
