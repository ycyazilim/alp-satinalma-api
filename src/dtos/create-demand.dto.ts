import { IsArray, IsString } from 'class-validator';

export class CreateDemandDto {
  @IsString()
  projectId: string;

  @IsArray()
  demandItems: Array<any>;

  @IsArray()
  approves: Array<any>;
}
