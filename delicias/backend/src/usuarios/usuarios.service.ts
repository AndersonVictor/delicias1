import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async obtenerPerfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        created_at: true,
      },
    });
    if (!usuario) {
      return {
        status: 404,
        body: {
          error: 'Usuario no encontrado',
          message: 'Tu perfil no fue encontrado',
        },
      };
    }
    return { status: 200, body: { usuario } };
  }

  async actualizarPerfil(
    usuarioId: number,
    data: Partial<{
      nombre: string;
      apellido: string;
      telefono?: string;
      direccion?: string;
    }>,
  ) {
    const fields: any = {};
    if (data.nombre !== undefined) fields.nombre = data.nombre;
    if (data.apellido !== undefined) fields.apellido = data.apellido;
    if (data.telefono !== undefined) fields.telefono = data.telefono;
    if (data.direccion !== undefined) fields.direccion = data.direccion;

    if (Object.keys(fields).length === 0) {
      return {
        status: 400,
        body: {
          error: 'Sin cambios',
          message: 'No se proporcionaron datos para actualizar',
        },
      };
    }

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: fields,
    });
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        created_at: true,
      },
    });
    return {
      status: 200,
      body: { message: 'Perfil actualizado exitosamente', usuario },
    };
  }

  async cambiarPassword(
    usuarioId: number,
    passwordActual: string,
    passwordNueva: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario || !usuario.activo) {
      return {
        status: 404,
        body: {
          error: 'Usuario no encontrado',
          message: 'Tu cuenta no fue encontrada',
        },
      };
    }
    const valid = await bcrypt.compare(passwordActual, usuario.password);
    if (!valid) {
      return {
        status: 400,
        body: {
          error: 'Contraseña incorrecta',
          message: 'La contraseña actual es incorrecta',
        },
      };
    }
    const hashed = await bcrypt.hash(passwordNueva, 10);
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: hashed },
    });
    return {
      status: 200,
      body: { message: 'Contraseña actualizada exitosamente' },
    };
  }

  async estadisticas(usuarioId: number) {
    const totalPedidos = await this.prisma.pedido.count({
      where: { usuario_id: usuarioId },
    });
    const pedidosPorEstado = await this.prisma.pedido.groupBy({
      by: ['estado'],
      where: { usuario_id: usuarioId },
      _count: { _all: true },
    });
    const sumTotal = await this.prisma.pedido.aggregate({
      where: { usuario_id: usuarioId, estado: { not: 'cancelado' } },
      _sum: { total: true },
    });
    const ultimoPedido = await this.prisma.pedido.findFirst({
      where: { usuario_id: usuarioId },
      orderBy: { created_at: 'desc' },
    });

    return {
      status: 200,
      body: {
        estadisticas: {
          total_pedidos: totalPedidos,
          pedidos_por_estado: pedidosPorEstado.map((p) => ({
            estado: p.estado,
            cantidad: p._count._all,
          })),
          total_gastado: parseFloat(sumTotal._sum.total?.toString() ?? '0'),
          ultimo_pedido: ultimoPedido ?? null,
        },
      },
    };
  }

  async adminList(params: {
    limite?: number;
    pagina?: number;
    buscar?: string;
    activo?: boolean | undefined;
  }) {
    const limite = params.limite ?? 20;
    const pagina = params.pagina ?? 1;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (params.buscar) {
      where.OR = [
        { nombre: { contains: params.buscar } },
        { apellido: { contains: params.buscar } },
        { email: { contains: params.buscar } },
      ];
    }
    if (params.activo !== undefined) {
      where.activo = params.activo;
    }

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          activo: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: limite,
        skip,
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      status: 200,
      body: {
        usuarios,
        pagination: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        },
      },
    };
  }

  async adminActualizar(
    id: number,
    body: {
      nombre?: string;
      apellido?: string;
      email?: string;
      telefono?: string | null;
      direccion?: string | null;
    },
  ) {
    const existente = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existente)
      return { status: 404, body: { error: 'Usuario no encontrado' } };

    const data: any = {};
    if (body.nombre !== undefined) {
      const nombre = String(body.nombre).trim();
      if (!nombre || nombre.length < 2)
        return {
          status: 400,
          body: {
            error: 'Datos inválidos',
            message: 'El nombre debe tener al menos 2 caracteres',
          },
        };
      data.nombre = nombre;
    }
    if (body.apellido !== undefined)
      data.apellido = String(body.apellido).trim();
    if (body.email !== undefined) {
      const email = String(body.email).trim();
      if (!email || !email.includes('@'))
        return {
          status: 400,
          body: { error: 'Datos inválidos', message: 'Email inválido' },
        };
      if (email !== existente.email) {
        const dup = await this.prisma.usuario.findUnique({ where: { email } });
        if (dup)
          return {
            status: 400,
            body: {
              error: 'Duplicado',
              message: 'Ya existe un usuario con ese email',
            },
          };
      }
      data.email = email;
    }
    if (body.telefono !== undefined) data.telefono = body.telefono || null;
    if (body.direccion !== undefined) data.direccion = body.direccion || null;

    if (Object.keys(data).length === 0)
      return { status: 400, body: { error: 'Sin cambios' } };

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      body: { message: 'Usuario actualizado', usuario: actualizado },
    };
  }

  async adminGet(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        activo: true,
        created_at: true,
      },
    });
    if (!usuario) {
      return {
        status: 404,
        body: {
          error: 'Usuario no encontrado',
          message: 'El usuario solicitado no existe',
        },
      };
    }
    const [totalPedidos, sumGastado] = await this.prisma.$transaction([
      this.prisma.pedido.count({ where: { usuario_id: id } }),
      this.prisma.pedido.aggregate({
        where: { usuario_id: id, estado: { not: 'cancelado' } },
        _sum: { total: true },
      }),
    ]);
    return {
      status: 200,
      body: {
        usuario: {
          ...usuario,
          estadisticas: {
            total_pedidos: totalPedidos,
            total_gastado: parseFloat(sumGastado._sum.total?.toString() ?? '0'),
          },
        },
      },
    };
  }

  async adminActualizarEstado(id: number, activo: boolean) {
    const existe = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existe) {
      return {
        status: 404,
        body: {
          error: 'Usuario no encontrado',
          message: 'El usuario solicitado no existe',
        },
      };
    }
    await this.prisma.usuario.update({ where: { id }, data: { activo } });
    return {
      status: 200,
      body: {
        message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      },
    };
  }
}
