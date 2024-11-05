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
    return this.roleModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }

  updateRole(id: string, updateRoleDto: CreateRoleDto) {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, {
      new: true,
    });
  }

  getRole() {
    return this.roleModel.find({ isDeleted: false });
  }
  detail(id: string) {
    return this.roleModel.findById(id);
  }
}
