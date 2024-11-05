import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DemandsService } from './demands.service';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user';
import { UpdateDemandDto } from '../../dtos/update-demand.dto';

@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createDemand(
    @Body() createDemandDto: CreateDemandDto,
    @CurrentUser() currentUser,
  ) {
    console.log('currentUser', currentUser);
    return this.demandsService.createDemand(createDemandDto, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateDemand(
    @Body() createDemandDto: UpdateDemandDto,
    @CurrentUser() currentUser,
  ) {
    console.log('currentUser', createDemandDto);
    return this.demandsService.updateDemand(createDemandDto, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('approve')
  approveDemand(
    @Body('demandId') demandId: string,
    @CurrentUser() currentUser,
  ) {
    return this.demandsService.approveDemand(demandId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('reject')
  rejectDemand(@Body('demandId') demandId: string, @CurrentUser() currentUser) {
    return this.demandsService.rejectDemand(demandId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('delete-role')
  deleteRoleFromDemand(
    @Body('demandId') demandId: string,
    @CurrentUser() currentUser,
  ) {
    return this.demandsService.deleteRoleFromDemand(demandId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('add-role')
  addRoleToDemand(
    @Body('demandId') demandId: string,
    @Body('roleId') roleId: string,
  ) {
    return this.demandsService.addRoleToDemand(demandId, roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string, @CurrentUser() currentUser) {
    return this.demandsService.findAll(+page, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  detail(@Query('id') id: string) {
    return this.demandsService.detail(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('filter')
  filter(
    @Query('name') name: string,
    @Query('page') page: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('showOnlyNew') showOnlyNew: boolean | undefined,
    @Query('showWatingApprove') showWatingApprove: boolean | undefined,
    @Query('showArhive') showArhive: boolean | undefined,
    @CurrentUser() currentUser,
  ) {
    return this.demandsService.filter(
      name,
      +page,
      startDate,
      endDate,
      showOnlyNew,
      showWatingApprove,
      showArhive,
      currentUser._id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  delete(@Query('id') id: string) {
    return this.demandsService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('read')
  read(@Body('id') id: string, @CurrentUser() currentUser) {
    return this.demandsService.read(id, currentUser._id);
  }
}
