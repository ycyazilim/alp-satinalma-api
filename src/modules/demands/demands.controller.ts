import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { DemandsService } from './demands.service';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user';

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
}
