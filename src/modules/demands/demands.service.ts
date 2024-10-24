import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { Demand, DemandDocument } from 'src/schemas/demand.schema';
import { Role, RoleDocument } from 'src/schemas/role.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DemandsService {
  constructor(
    @InjectModel(Demand.name) private demandModel: Model<DemandDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async createDemand(
    createDemandDto: CreateDemandDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const roles = await this.roleModel.find({});

    console.log(
      roles.map((role: any) => ({ [role.role]: null, level: role.level })),
    );

    const {
      documentType,
      projectName,
      projectCode,
      constructorChef,
      demandItems,
    } = createDemandDto;

    const demandData = {
      documentType,
      projectName,
      projectCode,
      demandRequester: findUser._id,
      constructorChef,
      demandItems,
      roles: roles.reduce((acc: any, role: any) => {
        acc[role.role] = {
          status: null,
          level: role.level || null, // Her role için level ekliyoruz
        };
        return acc;
      }, {}),
    };

    const demand = new this.demandModel(demandData);
    await demand.save();

    return demand;
  }

  async approveDemand(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).lean();
    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('approve user', findUser);
    console.log('document', findDocument);

    const findUserRole: any = findUser.role;

    if (!findDocument) {
      throw new Error('Document not found');
    }

    if (!findUser) {
      throw new Error('User not found');
    }

    if (!findUserRole) {
      throw new Error('User role not found');
    }

    const findUserRoleLevel = findDocument.roles[findUserRole]?.level;

    if (!findUserRoleLevel) {
      throw new Error('Role level not found for this user');
    }

    const lowerLevelRole = Object.keys(findDocument.roles).find((role) => {
      return findDocument.roles[role].level === findUserRoleLevel - 2;
    });

    if (lowerLevelRole && findDocument.roles[lowerLevelRole].status !== true) {
      throw new Error(
        `Approval denied. The role ${lowerLevelRole} (level ${findUserRoleLevel - 2}) must approve first.`,
      );
    }

    const updateDocumentRole = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findUserRole}.status`]: true,
        },
      },
      { new: true },
    );

    console.log('updateDocumentRole', updateDocumentRole);

    return updateDocumentRole;
  }

  async rejectDemand(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).lean();

    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('reject user', findUser);

    console.log('document', findDocument);

    const findUserRole: any = findUser.role;

    if (!findDocument) {
      throw new Error('Document not found');
    }

    if (!findUser) {
      throw new Error('User not found');
    }

    if (!findUserRole) {
      throw new Error('User role not found');
    }

    const rejectDemandByUser = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findUserRole}.status`]: false,
        },
      },
      { new: true },
    );

    console.log('rejectDemandByUser', rejectDemandByUser);

    return rejectDemandByUser;
  }

  async deleteRoleFromDemand(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).lean();

    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('delete user', findUser);

    console.log('document', findDocument);

    const findUserRole: any = findUser.role;

    if (!findDocument) {
      throw new Error('Document not found');
    }

    if (!findUser) {
      throw new Error('User not found');
    }

    const deleteRoleFromDemand = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $unset: {
          [`roles.${findUserRole}`]: '',
        },
      },
      { new: true },
    );

    console.log(deleteRoleFromDemand);

    return deleteRoleFromDemand;
  }

  async addRoleToDemand(demandId: string, roleId: string) {
    const findRole = await this.roleModel.findById(roleId).lean();

    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('role', findRole);

    console.log('document', findDocument);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    if (!findRole) {
      throw new Error('Role not found');
    }

    if (findDocument.roles[findRole.role]) {
      throw new Error('Role already exists in the document');
    }

    const addRoleToDemand = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findRole.role}`]: {
            status: null,
            level: findRole.level,
          },
        },
      },
      { new: true },
    );

    console.log(addRoleToDemand);

    return addRoleToDemand;
  }

  async addFirmToDemand(demandId: string, firms: Array<any>, notes: string) {
    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('document', findDocument);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const addFirmToDemand = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $push: {
          firms: {
            $each: firms.map((firm) => ({
              _id: uuidv4(), // Her firmaya unique bir ID atıyoruz
              ...firm,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          },
        },
        notes: notes,
      },
      { new: true },
    );

    console.log(addFirmToDemand);

    return addFirmToDemand;
  }

  async deleteFirmFromDemand(demandId: string, firmId: string) {
    const findDocument = await this.demandModel.findById(demandId).lean();

    console.log('document', findDocument);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const deleteFirmFromDemand = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $pull: {
          firms: {
            _id: firmId,
          },
        },
      },
      { new: true },
    );

    console.log(deleteFirmFromDemand);

    return deleteFirmFromDemand;
  }
}
