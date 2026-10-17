import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class BulkUpdateTodoDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];

  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'DONE', 'todo', 'in_progress', 'done'])
  status?: string;

  @IsOptional()
  starred?: boolean;

  @IsOptional()
  @IsString()
  action?: string;
}
