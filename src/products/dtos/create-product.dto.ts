import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  releaseDate: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;
}
