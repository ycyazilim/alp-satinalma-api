import { IsBoolean, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  role: string;

  @IsBoolean()
  isObserver: boolean;

  @IsString()
  id: string;
}
