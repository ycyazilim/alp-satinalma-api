import { Injectable } from '@nestjs/common';
import { CreateUserProjectDto } from './dto/create-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserProject,
  UserProjectDocument,
} from '../../schemas/user.projects.schema';
import { Project, ProjectDocument } from '../../schemas/project.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UpdateUserProjectDto } from './dto/update-project.dto';
import { NotifiactionsService } from '../notifications/notifiactions.service';

@Injectable()
export class UserProjectsService {
  constructor(
    @InjectModel(UserProject.name)
    private userProject: Model<UserProjectDocument>,
    @InjectModel(Project.name)
    private projects: Model<ProjectDocument>,
    @InjectModel(User.name)
    private users: Model<UserDocument>,
    private notificanctions: NotifiactionsService,
  ) {}

  async create(createProjectDto: CreateUserProjectDto) {
    const user = await this.users.findById(createProjectDto.userId);
    console.log(user);
    console.log(createProjectDto.userId);
    const projectData = await this.projects.findById(
      createProjectDto.projectId,
    );
    const oldData = await this.userProject.findOne({
      project: projectData,
      user: user,
      isDeleted: false,
    });
    console.log(oldData);

    if (oldData) {
      return oldData;
    }
    const project = new this.userProject({
      user: user,
      project: projectData,
    });
    await this.notificanctions.createOneSignalNotificationSpecificUser(
      createProjectDto.userId,
      'Yeni projeye atandınız',
      'Yeni Proje',

      1,
    );
    return await project.save();
  }

  async update(createProjectDto: UpdateUserProjectDto) {
    const user = await this.users.findById(createProjectDto.userId);
    console.log(user);
    console.log(createProjectDto.userId);
    const projectData = await this.projects.findById(
      createProjectDto.projectId,
    );

    const oldData = await this.userProject.findOne({
      project: projectData,
      user: user,
      isDeleted: false,
    });
    console.log(oldData);
    if (oldData) {
      return oldData;
    }
    await this.notificanctions.createOneSignalNotificationSpecificUser(
      createProjectDto.userId,
      'Atandığınız proje güncellendi',
      'Proje güncelemesi',
      1,
    );
    return this.userProject.findByIdAndUpdate(
      createProjectDto.id,
      {
        user: user,
        project: projectData,
      },
      { new: true },
    );
  }

  async findAll(page: number) {
    const count = await this.userProject.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.userProject
      .find({ isDeleted: false })
      .populate({
        path: 'user',
        populate: [{ path: 'role', model: 'Role' }],
      })
      .populate({
        path: 'project',
        populate: [{ path: 'company', model: 'Company' }],
      })
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }
  detail(id: string) {
    return this.userProject.findById(id).populate('user').populate('project');
  }

  async filter(name: string, page: number, startDate: string, endDate: string) {
    const query: any = {
      name: { $regex: name, $options: 'i' },
      isDeleted: false,
    };
    if (startDate != '') {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }

    if (endDate != '') {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }
    const count = await this.userProject.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.userProject
      .find(query)
      .populate({
        path: 'user',
        populate: [{ path: 'role', model: 'Role' }],
      })
      .populate({
        path: 'project',
        populate: [{ path: 'company', model: 'Company' }],
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
    return this.userProject.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }
}
