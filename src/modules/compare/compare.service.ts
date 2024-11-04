import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Demand, DemandDocument } from 'src/schemas/demand.schema';
import { Role, RoleDocument } from 'src/schemas/role.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

import { Project, ProjectDocument } from '../../schemas/project.schema';
import { Compare, CompareDocument } from '../../schemas/compare.schema';
import { CreateCompareDto } from '../../dtos/create-compare.dto';
import {
  UserProject,
  UserProjectDocument,
} from '../../schemas/user.projects.schema';
import { EditCompareDto } from '../../dtos/edit-compare.dto';

@Injectable()
export class CompareService {
  constructor(
    @InjectModel(Compare.name) private compareModel: Model<CompareDocument>,
    @InjectModel(Demand.name) private demandModel: Model<DemandDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(UserProject.name)
    private userProjectModel: Model<UserProjectDocument>,
  ) {}

  async createCompare(
    createCompareDto: CreateCompareDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const roles = await this.roleModel.find({});
    const { demandId, firms, note, selectedCompanyId } = createCompareDto;
    console.log(demandId);
    const demand = await this.demandModel
      .findById(demandId)
      .populate('project');
    console.log(demand);
    const compareData = {
      projectId: demand.project._id,
      project: demand.project,
      demand: demand,
      firms: firms,
      note: note,
      selectedCompanyId: selectedCompanyId,
      roles: roles.reduce((acc: any, role: any) => {
        acc[role.role] = {
          status: null,
          level: role.level || null, // Her role için level ekliyoruz
        };
        return acc;
      }, {}),
    };

    const compare = new this.compareModel(compareData);
    await compare.save();

    return compare;
  }
  async updateCompare(
    createCompareDto: EditCompareDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const roles = await this.roleModel.find({});
    const { demandId, firms, note, selectedCompanyId } = createCompareDto;
    console.log(demandId);
    const demand = await this.demandModel
      .findById(demandId)
      .populate('project');
    console.log(demand);
    const compareData = {
      projectId: demand.project._id,
      project: demand.project,
      demand: demand,
      firms: firms,
      note: note,
      selectedCompanyId: selectedCompanyId,
      roles: roles.reduce((acc: any, role: any) => {
        acc[role.role] = {
          status: null,
          level: role.level || null, // Her role için level ekliyoruz
        };
        return acc;
      }, {}),
    };
    return this.compareModel.findByIdAndUpdate(
      createCompareDto.id,
      {
        ...compareData,
      },
      { new: true },
    );
  }

  async approveCompare(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).lean();
    const findDocument = await this.compareModel.findById(demandId).lean();
    console.log('document', demandId);

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
    console.log(lowerLevelRole);
    if (
      higherLeveLRole &&
      findDocument.roles[higherLeveLRole].status !== true
    ) {
      throw new BadRequestException(
        `${lowerLevelRole} onaylamadan önce ${higherLeveLRole} onaylaması lazım.`,
      );
    }

    const updateDocumentRole = await this.compareModel.findByIdAndUpdate(
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

  async dennyCompare(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).lean();
    const findDocument = await this.compareModel.findById(demandId).lean();
    console.log('document', demandId);

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

    console.log(lowerLevelRole);

    const updateDocumentRole = await this.compareModel.findByIdAndUpdate(
      demandId,
      {
        $set: {
          [`roles.${findUserRole}.status`]: false,
        },
      },
      { new: true },
    );

    console.log('updateDocumentRole', updateDocumentRole);

    return updateDocumentRole;
  }

  async findAll(page: number, currentUserId: string) {
    const currentUser = await this.userModel.findById(currentUserId);
    const query: any = {
      isDeleted: false,
    };
    if (currentUser.isAdmin != true) {
      const currentUserProjects = await this.userProjectModel.find({
        user: currentUser,
      });
      const projectIds = currentUserProjects.map((project) =>
        project.project._id.toString(),
      );

      query.projectId = {
        $in: projectIds, // demand içindeki project alanı, projectIds'de bulunan değerlerden biri olmalı
      };
    }
    console.log(query);
    const count = await this.compareModel.countDocuments().exec();
    const page_total = Math.floor((count - 1) / 20) + 1;

    const data = await this.compareModel
      .find(query)
      .populate({
        path: 'demand',
        populate: [
          { path: 'project', model: 'Project' },

          { path: 'demandRequester', model: 'User' },
        ],
      })
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
    const query: any = {
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
      const projectIds = currentUserProjects.map((project) =>
        project.project._id.toString(),
      );

      query.projectId = {
        $in: projectIds, // demand içindeki project alanı, projectIds'de bulunan değerlerden biri olmalı
      };
    }
    console.log(query);
    const count = await this.compareModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.compareModel
      .find(query)
      .populate({
        path: 'demand',
        populate: [
          { path: 'project', model: 'Project' },
          { path: 'demandRequester', model: 'User' },
        ],
      })
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
    return this.compareModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }

  async read(id: string, userId: string) {
    const data = await this.compareModel.findById(id);
    console.log(data);
    if (!data.readUsers.includes(userId)) {
      return this.compareModel.findByIdAndUpdate(
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
