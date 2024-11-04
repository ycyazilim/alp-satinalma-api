import { IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  chef: string;
}
