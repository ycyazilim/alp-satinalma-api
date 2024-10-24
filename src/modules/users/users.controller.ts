import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UpdateUserDto } from 'src/dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Delete('delete')
  delete(@Body('id') id: string) {
    return this.usersService.delete(id);
  }

  @Put('update')
  update(@Body() updateUserDto: UpdateUserDto, @Body('id') id: string) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Get('find')
  find(@Body('id') id: string) {
    return this.usersService.getSingleUser(id);
  }
}
