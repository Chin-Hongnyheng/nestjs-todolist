import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class BulkDeleteTodoDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
