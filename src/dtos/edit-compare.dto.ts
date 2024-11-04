import { IsArray, IsOptional, IsString } from 'class-validator';

export class EditCompareDto {
  @IsString()
  id: string;

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
