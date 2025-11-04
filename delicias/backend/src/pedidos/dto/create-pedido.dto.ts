import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductoItemDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  cantidad: number;
}

export class CreatePedidoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoItemDto)
  productos: ProductoItemDto[];

  @IsOptional()
  @IsDateString()
  fecha_entrega?: string;

  @IsOptional()
  @IsString()
  direccion_entrega?: string;

  @IsOptional()
  @IsString()
  telefono_contacto?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  pago?: {
    metodo?: 'card' | 'cash';
    tarjeta?: { numero: string; nombre: string; exp: string; cvv: string };
  };
}
