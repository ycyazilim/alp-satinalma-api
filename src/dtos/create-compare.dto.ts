import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCompareDto {
  @IsString()
  demandId: string;

  @IsArray()
  firms: Array<any>;

  @IsString()
  selectedCompanyId: string;

  @IsString()
  @IsOptional()
  note: string;
}
