import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProjectDto } from './dto/update-project-dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  update(@Body() createProjectDto: UpdateProjectDto) {
    return this.projectsService.update(createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string) {
    return this.projectsService.findAll(+page);
  }
  @UseGuards(JwtAuthGuard)
  @Get('filter')
  filter(
    @Query('name') name: string,
    @Query('page') page: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.projectsService.filter(name, +page, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  delete(@Query('id') id: string) {
    return this.projectsService.remove(id);
  }
}
