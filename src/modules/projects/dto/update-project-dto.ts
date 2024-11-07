import { IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  chef: string;

  @IsString()
  id: string;

  @IsString()
  companyId: string;
}
