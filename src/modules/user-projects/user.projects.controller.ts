import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserProjectsService } from './user.projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserProjectDto } from './dto/create-project.dto';
import { UpdateUserProjectDto } from './dto/update-project.dto';

@Controller('userProjects')
export class UserProjectsController {
  constructor(private readonly projectsService: UserProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProjectDto: CreateUserProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  update(@Body() createProjectDto: UpdateUserProjectDto) {
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
