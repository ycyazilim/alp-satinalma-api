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
import { NotifiactionsService } from '../notifications/notifiactions.service';
import { ProductService } from '../products/product.service';

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
    private notificanctions: NotifiactionsService,
    private productOffer: ProductService,
  ) {}

  async createCompare(
    createCompareDto: CreateCompareDto,
    documentRequesterId: string,
  ) {
    const findUser = await this.userModel.findById(documentRequesterId);

    if (!findUser) {
      throw new Error('User not found');
    }

    const { demandId, firms, note, selectedCompanyId } = createCompareDto;
    const demand = await this.demandModel
      .findById(demandId)
      .populate('project');
    const compareData = {
      projectId: demand.project._id,
      project: demand.project,
      demand: demand,
      firms: firms,
      note: note,
      selectedCompanyId: selectedCompanyId,
      roles: demand.roles.map((e) => {
        return {
          ...e,
          status: null,
          approveName: null,
        };
      }),
    };
    this.productOffer.addNewOffer(firms);
    const compare = new this.compareModel(compareData);
    await compare.save();
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: demand.project._id,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        'Projenize bir karşılaştırma eklendi',
        'Proje karşılaştırma',
        3,
      );
    }
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
      roles: demand.roles.map((e) => {
        return {
          ...e,
          status: null,
          approveName: null,
        };
      }),
    };

    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: demand.project._id,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      await this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        'Projenizede bir karşılaştırma güncellendi',
        'Proje karşılaştırma',
        3,
      );
    }
    this.productOffer.addNewOffer(firms);

    return this.compareModel.findByIdAndUpdate(
      createCompareDto.id,
      {
        ...compareData,
      },
      { new: true },
    );
  }

  async approveCompare(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).populate('role');
    const findDocument = await this.compareModel.findById(demandId);
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
    if (
      higherLeveLRole &&
      findDocument.roles[higherLeveLRole].status !== true
    ) {
      throw new BadRequestException(
        `${lowerLevelRole.roleModel.role} onaylamadan önce ${higherLeveLRole.roleModel.role} onaylaması lazım.`,
      );
    }

    const updateDocumentRole = await this.compareModel.findByIdAndUpdate(
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

    console.log('updateDocumentRole', updateDocumentRole);
    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: findDocument.projectId,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir karşılaştırması ${findUserRole} tarafından onaylandı`,
        'Proje karşılaştırması',
        3,
      );
    }
    return updateDocumentRole;
  }

  async dennyCompare(demandId: string, userId: string) {
    const findUser = await this.userModel.findById(userId).populate('role');
    const findDocument = await this.compareModel.findById(demandId);
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

    const updateDocumentRole = await this.compareModel.findByIdAndUpdate(
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

    const usersForProject = await this.userProjectModel
      .find({
        project: {
          _id: findDocument.projectId,
        },
      })
      .populate('user');
    for (const i of usersForProject) {
      this.notificanctions.createOneSignalNotificationSpecificUser(
        i.user._id.toString(),
        `Projenize bir karşılaştırması ${findUserRole} tarafından red edildi`,
        'Proje karşılaştırması',
        3,
      );
    }

    console.log('updateDocumentRole', updateDocumentRole);

    return updateDocumentRole;
  }

  async approveCompareAdmin(demandId: string, roleId: string) {
    const findDocument = await this.compareModel.findById(demandId);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const lowerLevelRole = findDocument.roles.find(
      (role) => role.roleModel && role.roleModel._id === roleId,
    );

    const updateDocumentRole = await this.compareModel.findByIdAndUpdate(
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
          _id: findDocument.projectId,
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

  async rejectCompareAdmin(demandId: string, roleId: string) {
    const findDocument = await this.compareModel.findById(demandId);

    if (!findDocument) {
      throw new Error('Document not found');
    }

    const lowerLevelRole = findDocument.roles.find(
      (role) => role.roleModel && role.roleModel._id === roleId,
    );

    const rejectDemandByUser = await this.compareModel.findByIdAndUpdate(
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
          _id: findDocument.projectId,
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
          {
            path: 'project',
            model: 'Project',
            populate: [{ path: 'company', model: 'Company' }],
          },

          {
            path: 'demandRequester',
            model: 'User',
            populate: [{ path: 'role', model: 'Role' }],
          },
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

  async detail(id: string) {
    return this.compareModel.findById(id).populate({
      path: 'demand',
      populate: [
        {
          path: 'project',
          model: 'Project',
          populate: [{ path: 'company', model: 'Company' }],
        },

        {
          path: 'demandRequester',
          model: 'User',
          populate: [{ path: 'role', model: 'Role' }],
        },
      ],
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
          {
            path: 'project',
            model: 'Project',
            populate: [{ path: 'company', model: 'Company' }],
          },

          {
            path: 'demandRequester',
            model: 'User',
            populate: [{ path: 'role', model: 'Role' }],
          },
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
