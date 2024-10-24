import { IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  role: string;

  @IsNumber()
  level: number;
}
