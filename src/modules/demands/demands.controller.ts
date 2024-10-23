import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DemandsService } from './demands.service';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user';

@UseGuards(JwtAuthGuard)
@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Post('create')
  createDemand(
    @Body() createDemandDto: CreateDemandDto,
    @CurrentUser() currentUser,
  ) {
    return this.demandsService.createDemand(createDemandDto, currentUser._id);
  }
}
