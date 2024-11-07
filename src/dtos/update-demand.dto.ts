import { IsArray, IsString } from 'class-validator';

export class UpdateDemandDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsArray()
  deletedFiles: Array<any>;

  @IsArray()
  demandItems: Array<any>;

  @IsArray()
  approves: Array<any>;
}
