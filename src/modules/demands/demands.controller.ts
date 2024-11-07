import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DemandsService } from './demands.service';
import { CreateDemandDto } from 'src/dtos/create-demand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user';
import { UpdateDemandDto } from '../../dtos/update-demand.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AddDemandFile } from '../../dtos/add-demand-file';
import { extname } from 'path';

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
  @Post('addDemandItemFile')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploadedFiles/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname;
          const extension = extname(originalName);
          const newFileName = uniqueSuffix + extension;
          callback(null, newFileName);
        },
      }),
    }),
  )
  addDemandItemFile(
    @Body() addDemandFile: AddDemandFile,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(files);
    return this.demandsService.addFileToDemand(addDemandFile, files);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateDemand(
    @Body() createDemandDto: UpdateDemandDto,
    @CurrentUser() currentUser,
  ) {
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
  @Put('approveAdmin')
  approveDemandAdmin(
    @Body('demandId') demandId: string,
    @Body('roleId') roleId: string,
  ) {
    return this.demandsService.approveDemandAdmin(demandId, roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('rejectAdmin')
  rejectDemandAdmin(
    @Body('demandId') demandId: string,
    @Body('roleId') roleId: string,
  ) {
    return this.demandsService.rejectDemandAdmin(demandId, roleId);
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
