import { IsArray, IsString } from 'class-validator';

export class AddDemandFile {
  @IsString()
  demandId: string;

  @IsArray()
  filesToAdd: Array<any>;
}
