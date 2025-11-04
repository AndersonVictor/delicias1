import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, AdminGuard],
})
export class ProductosModule {}
