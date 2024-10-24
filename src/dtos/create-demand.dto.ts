import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDemandDto {
  @IsString()
  documentType: string;

  @IsString()
  projectName: string;

  @IsString()
  projectCode: string;

  @IsString()
  @IsOptional()
  demandRequester: string;

  @IsString()
  constructorChef: string;

  @IsArray()
  demandItems: Array<any>;
}
