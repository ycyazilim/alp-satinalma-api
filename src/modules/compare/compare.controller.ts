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
import { CompareService } from './compare.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user';
import { CreateCompareDto } from '../../dtos/create-compare.dto';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createCompare(
    @Body() createCompareDto: CreateCompareDto,
    @CurrentUser() currentUser,
  ) {
    console.log('currentUser', currentUser);
    return this.compareService.createCompare(createCompareDto, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('approve')
  approveCompare(
    @Body('demandId') demandId: string,
    @CurrentUser() currentUser,
  ) {
    return this.compareService.approveCompare(demandId, currentUser._id);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string, @CurrentUser() currentUser) {
    return this.compareService.findAll(+page, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read')
  read(@Body('id') id: string, @CurrentUser() currentUser) {
    return this.compareService.read(id, currentUser._id);
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
    return this.compareService.filter(
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
    return this.compareService.remove(id);
  }
}
