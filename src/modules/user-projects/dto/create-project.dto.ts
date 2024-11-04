import { IsString } from 'class-validator';

export class CreateUserProjectDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
