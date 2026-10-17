import { IsOptional, IsString } from 'class-validator';

export class QueryTodoDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
