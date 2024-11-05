import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { Demand, DemandDocument } from 'src/schemas/demand.schema';
import { Role, RoleDocument } from 'src/schemas/role.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

import { Project, ProjectDocument } from '../../schemas/project.schema';
import {
  UserProject,
  UserProjectDocument,
} from '../../schemas/user.projects.schema';
import { UpdateDemandDto } from '../../dtos/update-demand.dto';
import { NotifiactionsService } from '../notifications/notifiactions.service';

@Injectable()
export class DemandsService {
  constructor(
    @InjectModel(UserProject.name)
    private userProject: Model<UserProjectDocument>,
    @InjectModel(Demand.name) private demandModel: Model<DemandDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(UserProject.name)
    private userProjectModel: Model<UserProjectDocument>,
    private notificanctions: NotifiactionsService,
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

    const { projectId, demandItems } = createDemandDto;
    const project = await this.projectModel.findById(projectId);
    const demandData = {
      projectName: project.name,
      projectCode: project.code,
      demandRequester: findUser._id,
      constructorChef: project.chef,
      project: project,
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
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: createDemandDto.projectId,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        'Projenize bir talep eklendi',
        'Proje talebi',
        2,
      );
    }
    return demand;
  }

  async updateDemand(
    createDemandDto: UpdateDemandDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const roles = await this.roleModel.find({});

    const { projectId, demandItems } = createDemandDto;
    const project = await this.projectModel.findById(projectId);
    const demandData = {
      projectName: project.name,
      projectCode: project.code,
      demandRequester: findUser._id,
      constructorChef: project.chef,
      project: project,
      demandItems,
      roles: roles.reduce((acc: any, role: any) => {
        acc[role.role] = {
          status: null,
          level: role.level || null, // Her role için level ekliyoruz
        };
        return acc;
      }, {}),
    };
    console.log(demandData);
    const response = await this.demandModel.findByIdAndUpdate(
      createDemandDto.id,
      {
        ...demandData,
      },
      { new: true },
    );
    console.log(response);
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: createDemandDto.projectId,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        'Projenizde bir talep güncellendi',
        'Proje talebi',
        2,
      );
    }

    return response;
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
      return findDocument.roles[role].level === findUserRoleLevel;
    });

    const higherLeveLRole = Object.keys(findDocument.roles).find((role) => {
      return findDocument.roles[role].level === findUserRoleLevel - 1;
    });

    if (
      higherLeveLRole &&
      findDocument.roles[higherLeveLRole].status !== true
    ) {
      throw new BadRequestException(
        `${lowerLevelRole} onaylamadan önce ${higherLeveLRole} onaylaması lazım.`,
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
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: findDocument.project,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep ${findUserRole} tarafından onaylandı`,
        'Proje talebi',
        2,
      );
    }
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
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: findDocument.project,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep ${findUserRole} tarafından red edildi`,
        'Proje talebi',
        2,
      );
    }
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

  async findAll(page: number, currentUserId: string) {
    const currentUser = await this.userModel.findById(currentUserId);

    const query: any = {
      isDeleted: false,
    };
    console.log(currentUser.isAdmin);
    if (currentUser.isAdmin != true) {
      const currentUserProjects = await this.userProjectModel.find({
        user: currentUser,
      });
      const projectIds = currentUserProjects.map((project) => project.project);

      query.project = {
        $in: projectIds,
      };
    }
    const count = await this.demandModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.demandModel
      .find(query)
      .populate('project')
      .populate('demandRequester')
      .sort({
        createdAt: -1,
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
    return this.demandModel
      .findById(id)
      .populate('project')
      .populate('demandRequester');
  }

  async filter(
    name: string,
    page: number,
    startDate: string,
    endDate: string,
    showOnlyNew: boolean | undefined,
    showWatingApprove: boolean | undefined,
    showArhive: boolean | undefined,
    currentUserId: string,
  ) {
    const currentUser = await this.userModel.findById(currentUserId);
    console.log(currentUser);
    const query: any = {
      projectName: { $regex: name, $options: 'i' },
      constructorChef: { $regex: name, $options: 'i' },
      isDeleted: false,
    };
    if (showOnlyNew != undefined) {
      query.readUsers = { $ne: currentUserId };
    }
    if (showArhive != undefined) {
      query.isDeleted = true;
    }
    if (showWatingApprove != undefined) {
      query[`roles.${currentUser.role}.status`] = { $ne: true };
    }
    if (startDate != '') {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }
    if (endDate != '') {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    if (currentUser.isAdmin != true) {
      const currentUserProjects = await this.userProjectModel.find({
        user: currentUser,
      });
      const projectIds = currentUserProjects.map((project) => project.project);

      query.project = {
        $in: projectIds,
      };
    }
    console.log(query);
    const count = await this.demandModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.demandModel
      .find(query)
      .populate('project')
      .populate('demandRequester')
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  remove(id: string) {
    return this.demandModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }

  async read(id: string, userId: string) {
    const data = await this.demandModel.findById(id);
    if (!(data.readUsers ?? []).includes(userId)) {
      return this.demandModel.findByIdAndUpdate(
        id,
        {
          readUsers: [...data.readUsers, userId],
        },
        { new: true },
      );
    } else {
      return true;
    }
  }
}
