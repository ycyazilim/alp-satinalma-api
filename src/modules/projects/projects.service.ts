import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../schemas/project.schema';
import { UpdateProjectDto } from './dto/update-project-dto';
import { Company, CompanyDocument } from '../../schemas/company.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const findComapny = await this.companyModel.findById(
      createProjectDto.companyId,
    );
    const project = new this.projectModel({
      ...createProjectDto,
      company: findComapny,
    });
    return await project.save();
  }

  async update(createProjectDto: UpdateProjectDto) {
    const findComapny = await this.companyModel.findById(
      createProjectDto.companyId,
    );

    return this.projectModel.findByIdAndUpdate(
      createProjectDto.id,
      {
        ...createProjectDto,
        company: findComapny,
      },
      { new: true },
    );
  }

  async findAll(page: number) {
    const count = await this.projectModel.countDocuments({}).exec();
    const page_total = Math.floor((count - 1) / 20) + 1;
    const data = await this.projectModel
      .find({ isDeleted: false })
      .populate('company')
      .limit(20)
      .skip(page * 20)
      .exec();
    return {
      data: data,
      page_total: page_total,
    };
  }

  async detail(id: string) {
    return this.projectModel.findById(id).populate('company');
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
      .populate('company')
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
