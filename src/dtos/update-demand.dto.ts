import { IsArray, IsString } from 'class-validator';

export class UpdateDemandDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsArray()
  demandItems: Array<any>;
}
