import { IsBoolean, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  role: string;

  @IsBoolean()
  isObserver: boolean;
}
