import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UpdateUserDto } from 'src/dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string) {
    return this.usersService.findAll(+page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  detail(@Query('id') id: string) {
    return this.usersService.detail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filter')
  filter(
    @Query('name') name: string,
    @Query('page') page: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.usersService.filter(name, +page, startDate, endDate);
  }

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Delete('delete')
  delete(@Body('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('update')
  update(@Body() updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return this.usersService.updateUser(updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addOneSignal')
  addOneSignal(@Body('oneSignalId') id: string, @CurrentUser() currentUser) {
    return this.usersService.addOneSignal(id, currentUser._id);
  }

  @Get('find')
  find(@Body('id') id: string) {
    return this.usersService.getSingleUser(id);
  }
}
