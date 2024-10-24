import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findAll() {
    return this.userModel.find();
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

    const newUser = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
    });

    await newUser.save();

    return newUser;
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
  }
}
