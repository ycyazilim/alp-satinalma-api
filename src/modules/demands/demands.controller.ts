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

  @UseGuards(JwtAuthGuard)
  @Put('add-firm')
  addFirmToDemand(
    @Body('demandId') demandId: string,
    @Body('firms') firms: Array<any>,
    @Body('notes') notes: string,
  ) {
    return this.demandsService.addFirmToDemand(demandId, firms, notes);
  }

  @UseGuards(JwtAuthGuard)
  @Put('delete-firm')
  deleteFirmFromDemand(
    @Body('demandId') demandId: string,
    @Body('firmId') firmId: string,
  ) {
    return this.demandsService.deleteFirmFromDemand(demandId, firmId);
  }
}
