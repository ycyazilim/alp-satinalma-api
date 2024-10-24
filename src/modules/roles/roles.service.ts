import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDto } from 'src/dtos/create-role.dto';
import { Role, RoleDocument } from 'src/schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const role = new this.roleModel({
      role: createRoleDto.role,
      level: createRoleDto.level,
    });
    return await role.save();
  }

  async deleteRole(id: string) {
    return await this.roleModel.findByIdAndDelete(id);
  }

  async updateRole(id: string, updateRoleDto: CreateRoleDto) {
    return await this.roleModel.findByIdAndUpdate(id, updateRoleDto, {
      new: true,
    });
  }

  async getRole() {
    return await this.roleModel.find();
  }
}
