import { IsString } from 'class-validator';

export class UpdateUserProjectDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
