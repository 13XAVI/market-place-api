import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @IsString({message:"category name should be string"})
  @IsNotEmpty({message:"category name is required"})
  name: string;
  @IsString({message:"description  should be string"})
  @IsNotEmpty({message:"description  is required"})
  description: string;
}
