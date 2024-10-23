import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from 'src/dtos/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Delete('delete/:id')
  async deleteRole(@Param('id') id: string) {
    return await this.rolesService.deleteRole(id);
  }

  @Put('update/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: CreateRoleDto,
  ) {
    return await this.rolesService.updateRole(id, updateRoleDto);
  }

  @Get('get')
  async getRole() {
    return await this.rolesService.getRole();
  }
}
