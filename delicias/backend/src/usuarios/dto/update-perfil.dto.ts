import {
  IsOptional,
  IsString,
  MinLength,
  IsMobilePhone,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'Luis' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'García' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido?: string;

  @ApiPropertyOptional({ example: '600123456', description: 'Móvil español' })
  @IsOptional()
  @IsMobilePhone('es-ES', {}, { message: 'Teléfono inválido' })
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742' })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion?: string;
}
