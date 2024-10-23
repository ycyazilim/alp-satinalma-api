import { IsArray, IsString } from 'class-validator';

export class CreateDemandDto {
  @IsString()
  documentType: string;

  @IsString()
  projectName: string;

  @IsString()
  projectCode: string;

  @IsString()
  demandRequester: string;

  @IsString()
  constructorChef: string;

  @IsArray()
  demandItems: Array<any>;
}
