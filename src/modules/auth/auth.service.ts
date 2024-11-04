import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/dtos/register.dto';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async registerUser(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;
    const user = await this.userModel.findOne({ email }).lean();
    if (user) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      role: role ? role : 'yonetici1',
    });

    await newUser.save();

    const payload = {
      email,
      _id: newUser._id,
    };

    const token = this.jwtService.sign(payload);

    return { user: newUser, accessToken: token };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const findUser = await this.userModel.findOne({ email }).lean();

    if (!findUser) {
      throw new BadRequestException('email or password is incorrect');
    }

    const isPasswordMatch = await bcrypt.compare(password, findUser.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('email or password is incorrect');
    }

    const payload = {
      email,
      _id: findUser._id,
    };

    const token = this.jwtService.sign(payload);

    return { user: findUser, accessToken: token };
  }

  getUser(userId: string) {
    console.log(userId);
    return this.userModel.findById(userId).lean();
  }
}
