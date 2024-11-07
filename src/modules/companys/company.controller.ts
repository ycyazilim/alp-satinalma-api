import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly projectsService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.projectsService.create(createCompanyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  update(@Body() updateCompanyDto: UpdateCompanyDto) {
    return this.projectsService.update(updateCompanyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string) {
    return this.projectsService.findAll(+page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  detail(@Query('id') id: string) {
    return this.projectsService.detail(id);
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
