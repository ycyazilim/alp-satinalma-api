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
import { AddDemandFile } from '../../dtos/add-demand-file';
import * as fs from 'fs';
import * as path from 'path';

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
    const { projectId, demandItems, approves } = createDemandDto;

    const project = await this.projectModel.findById(projectId);
    const demandData = {
      projectName: project.name,
      projectCode: project.code,
      demandRequester: findUser._id,
      constructorChef: project.chef,
      project: project,
      demandItems,
      roles: approves,
    };
    console.log(demandData);

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

  async addFileToDemand(
    addDemandFile: AddDemandFile,
    files: Array<Express.Multer.File>,
  ) {
    const findDemand = await this.demandModel.findById(addDemandFile.demandId);

    if (!findDemand) {
      throw new Error('Demand not found');
    }
    const toAddFiles = [];
    for (const i of addDemandFile.filesToAdd) {
      toAddFiles.push({
        offerItemId: i.offerItemId,
        path: files.find((e) => e.fieldname === i.id).path,
        name: i.name,
        _id: i.id,
      });
    }
    findDemand.files = [...findDemand.files, ...toAddFiles];

    return this.demandModel.findByIdAndUpdate(
      addDemandFile.demandId,
      {
        files: findDemand.files,
      },
      {
        new: true,
      },
    );
  }

  async updateDemand(
    createDemandDto: UpdateDemandDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const { approves, projectId, demandItems, deletedFiles } = createDemandDto;
    console.log(deletedFiles);

    const project = await this.projectModel.findById(projectId);
    const oldData = await this.demandModel.findById(createDemandDto.id);

    const demandData = {
      projectName: project.name,
      projectCode: project.code,
      demandRequester: findUser._id,
      constructorChef: project.chef,
      project: project,
      demandItems,
      roles: approves,
      files: oldData.files,
    };
    if (deletedFiles) {
      const deleteFilesList = oldData.files.filter((a) =>
        deletedFiles.includes(a._id),
      );
      console.log(deleteFilesList);
      for (const i of deleteFilesList) {
        fs.unlink(path.join(__dirname, `../../../${i.path}`), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }

      demandData.files = oldData.files.filter(
        (a) => !deletedFiles.includes(a._id),
      );
      console.log(demandData.files);
    }
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
    const findUser = await this.userModel.findById(userId).populate('role');
    const findDocument = await this.demandModel.findById(demandId);

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

    const lowerLevelRole = findDocument.roles.find(
      (role) =>
        role.roleModel && role.roleModel._id === findUserRole._id.toString(),
    );
    const higherLeveLRole = findDocument.roles.find(
      (role) =>
        role.roleModel &&
        role.level !== null &&
        role.level < lowerLevelRole.level,
    );
    if (higherLeveLRole && higherLeveLRole.status !== true) {
      throw new BadRequestException(
        `${lowerLevelRole.roleModel.role} onaylamadan önce ${higherLeveLRole.roleModel.role} onaylaması lazım.`,
      );
    }

    const updateDocumentRole = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.status`]: true,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.approveName`]:
            findUser.nameSurname,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.createdAt`]:
            new Date().toISOString(),
        },
      },
      { new: true },
    );

    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: findDocument.project,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep ${findUserRole} tarafından onaylandı`,
        'Proje talebi',
        2,
      );
    }
    return updateDocumentRole;
  }

  async rejectDemand(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).populate('role');

    const findDocument = await this.demandModel.findById(demandId);

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

    const lowerLevelRole = findDocument.roles.find(
      (role) =>
        role.roleModel && role.roleModel._id === findUserRole._id.toString(),
    );

    const rejectDemandByUser = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.status`]: false,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.approveName`]:
            findUser.nameSurname,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.createdAt`]:
            new Date().toISOString(),
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
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep ${findUserRole} tarafından red edildi`,
        'Proje talebi',
        2,
      );
    }
    return rejectDemandByUser;
  }

  async approveDemandAdmin(demandId: string, roleId: string) {
    const findDocument = await this.demandModel.findById(demandId);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const lowerLevelRole = findDocument.roles.find(
      (role) => role.roleModel && role.roleModel._id === roleId,
    );

    const updateDocumentRole = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.status`]: true,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.approveName`]:
            'SİSTEM',
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.createdAt`]:
            new Date().toISOString(),
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
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep SİSTEM tarafından onaylandı`,
        'Proje talebi',
        2,
      );
    }
    return updateDocumentRole;
  }

  async rejectDemandAdmin(demandId: string, roleId: string) {
    const findDocument = await this.demandModel.findById(demandId);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const lowerLevelRole = findDocument.roles.find(
      (role) => role.roleModel && role.roleModel._id === roleId,
    );

    const rejectDemandByUser = await this.demandModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.status`]: false,
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.approveName`]:
            'SİSTEM',
          [`roles.${findDocument.roles.indexOf(lowerLevelRole)}.createdAt`]:
            new Date().toISOString(),
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
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir talep SİSTEM tarafından red edildi`,
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

    /* const addRoleToDemand = await this.demandModel.findByIdAndUpdate(
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

    return addRoleToDemand;*/
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
    const page_total = Math.floor((count - 1) / 10) + 1;
    const data = await this.demandModel
      .find(query)
      .populate({
        path: 'project',
        populate: [{ path: 'company', model: 'Company' }],
      })
      .populate('files')
      .populate({
        path: 'demandRequester',
        populate: [{ path: 'role', model: 'Role' }],
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .skip(page * 10)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  async detail(id: string) {
    return this.demandModel
      .findById(id)
      .populate({
        path: 'project',
        populate: [{ path: 'company', model: 'Company' }],
      })
      .populate({
        path: 'demandRequester',
        populate: [{ path: 'role', model: 'Role' }],
      });
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
    const currentUser = await this.userModel
      .findById(currentUserId)
      .populate('role');
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
      query.roles = {
        $elemMatch: {
          'roleModel._id': currentUser.role._id.toString(),
          status: null,
        },
      };
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
    const page_total = Math.floor((count - 1) / 10) + 1;
    const data = await this.demandModel
      .find(query)
      .populate({
        path: 'project',
        populate: [{ path: 'company', model: 'Company' }],
      })
      .populate({
        path: 'demandRequester',
        populate: [{ path: 'role', model: 'Role' }],
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .skip(page * 10)
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
