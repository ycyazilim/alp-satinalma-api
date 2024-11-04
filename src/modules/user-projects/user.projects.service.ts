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

@Injectable()
export class UserProjectsService {
  constructor(
    @InjectModel(UserProject.name)
    private userProject: Model<UserProjectDocument>,
    @InjectModel(Project.name)
    private projects: Model<ProjectDocument>,
    @InjectModel(User.name)
    private users: Model<UserDocument>,
  ) {}

  async create(createProjectDto: CreateUserProjectDto) {
    const user = await this.users.findById(createProjectDto.userId);
    console.log(user);
    console.log(createProjectDto.userId);
    const projectData = await this.projects.findById(
      createProjectDto.projectId,
    );
    const project = new this.userProject({
      user: user,
      project: projectData,
    });
    return await project.save();
  }

  async findAll(page: number) {
    const count = await this.userProject.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.userProject
      .find({ isDeleted: false })
      .populate('user')
      .populate('project')
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
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
