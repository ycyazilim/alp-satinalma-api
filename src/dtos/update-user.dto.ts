import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  role: string;

  @IsString()
  id: string;

  @IsString()
  nameSurname: string;
}
