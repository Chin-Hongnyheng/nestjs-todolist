import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReorderTodosDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
