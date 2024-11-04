import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../schemas/project.schema';
import { UpdateProjectDto } from './dto/update-project-dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}
  async create(createProjectDto: CreateProjectDto) {
    const project = new this.projectModel({
      ...createProjectDto,
    });
    return await project.save();
  }

  async update(createProjectDto: UpdateProjectDto) {
    return this.projectModel.findByIdAndUpdate(
      createProjectDto.id,
      {
        ...createProjectDto,
      },
      { new: true },
    );
  }
  async findAll(page: number) {
    const count = await this.projectModel.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.projectModel
      .find({ isDeleted: false })
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
    const count = await this.projectModel.countDocuments(query).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.projectModel
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
    return this.projectModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
  }
}
