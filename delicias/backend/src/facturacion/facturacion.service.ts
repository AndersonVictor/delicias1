import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FacturacionService {
  constructor(private prisma: PrismaService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private readonly decolectaBaseUrl =
    process.env.DECOLECTA_BASE_URL || 'https://api.decolecta.com/v1';

  private ensureFolder() {
    // Use /tmp for Vercel compatibility (ephemeral storage)
    const folder = path.join('/tmp', 'comprobantes');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    return folder;
  }

  private async uploadToCloudinary(
    filePath: string,
    publicId: string,
    resourceType: 'image' | 'raw' = 'raw',
  ): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        public_id: publicId,
        folder: 'comprobantes',
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  private toFloat(n: any): number {
    try {
      return parseFloat(String(n));
    } catch {
      return 0;
    }
  }

  private async fetchReniecDni(
    dni: string,
    token?: string,
  ): Promise<any | null> {
    if (!token) return null;
    // Según documentación, el parámetro es "numero"
    const url = `${this.decolectaBaseUrl}/reniec/dni?numero=${encodeURIComponent(dni)}`;
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  private async fetchSunatRuc(
    ruc: string,
    token?: string,
  ): Promise<any | null> {
    if (!token) return null;
    // Según documentación, el parámetro es "numero"
    const url = `${this.decolectaBaseUrl}/sunat/ruc/full?numero=${encodeURIComponent(ruc)}`;
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  // Exponer consultas independientes para autocompletar en el checkout
  async consultaReniecDni(numero: string, decolectaToken?: string) {
    if (!numero || numero.length !== 8) {
      return { status: 400, body: { message: 'El DNI debe tener 8 dígitos' } };
    }
    const data = await this.fetchReniecDni(numero, decolectaToken);
    if (!data)
      return {
        status: 404,
        body: { message: 'No se encontró información del DNI en RENIEC' },
      };
    return { status: 200, body: { dni: numero, data } };
  }

  async consultaSunatRuc(numero: string, decolectaToken?: string) {
    if (!numero || numero.length !== 11) {
      return { status: 400, body: { message: 'El RUC debe tener 11 dígitos' } };
    }
    const data = await this.fetchSunatRuc(numero, decolectaToken);
    if (!data)
      return {
        status: 404,
        body: { message: 'No se encontró información del RUC en SUNAT' },
      };
    return { status: 200, body: { ruc: numero, data } };
  }

  async emitir(
    usuarioId: number,
    params: {
      pedido_id: number;
      comprobante_tipo: 'boleta' | 'factura';
      tipo_documento: 'DNI' | 'RUC';
      numero_documento: string;
    },
    decolectaToken?: string,
  ) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id: params.pedido_id, usuario_id: usuarioId },
      include: { detalles: { include: { producto: true } }, usuario: true },
    });
    if (!pedido) {
      return {
        status: 404,
        body: {
          error: 'Pedido no encontrado',
          message: 'No se encontró el pedido para emitir comprobante',
        },
      };
    }

    // Validaciones simples
    if (
      params.comprobante_tipo === 'factura' &&
      params.tipo_documento !== 'RUC'
    ) {
      return {
        status: 400,
        body: {
          error: 'Documento inválido',
          message: 'Para FACTURA, el documento debe ser RUC',
        },
      };
    }
    if (
      params.tipo_documento === 'DNI' &&
      params.numero_documento.length !== 8
    ) {
      return {
        status: 400,
        body: {
          error: 'Documento inválido',
          message: 'El DNI debe tener 8 dígitos',
        },
      };
    }
    if (
      params.tipo_documento === 'RUC' &&
      params.numero_documento.length !== 11
    ) {
      return {
        status: 400,
        body: {
          error: 'Documento inválido',
          message: 'El RUC debe tener 11 dígitos',
        },
      };
    }

    const folder = this.ensureFolder();
    const serie = params.comprobante_tipo === 'boleta' ? 'B001' : 'F001';
    const numero = String(Math.floor(Math.random() * 900000) + 100000); // correlativo simple temporal
    const pdfRel = path.join(
      'comprobantes',
      `pedido-${pedido.id}-${serie}-${numero}.pdf`,
    );
    const xmlRel = path.join(
      'comprobantes',
      `pedido-${pedido.id}-${serie}-${numero}.xml`,
    );
    const imgRel = path.join(
      'comprobantes',
      `pedido-${pedido.id}-${serie}-${numero}.png`,
    );
    const pdfAbs = path.join(
      folder,
      `pedido-${pedido.id}-${serie}-${numero}.pdf`,
    );
    const xmlAbs = path.join(
      folder,
      `pedido-${pedido.id}-${serie}-${numero}.xml`,
    );
    const imgAbs = path.join(
      folder,
      `pedido-${pedido.id}-${serie}-${numero}.png`,
    );

    // Consultar identidad en RENIEC o SUNAT según tipo
    let identidad: any | null = null;
    let identidadVerificada = false;
    if (params.tipo_documento === 'DNI') {
      identidad = await this.fetchReniecDni(
        params.numero_documento,
        decolectaToken,
      );
      identidadVerificada = !!identidad;
    } else if (params.tipo_documento === 'RUC') {
      identidad = await this.fetchSunatRuc(
        params.numero_documento,
        decolectaToken,
      );
      identidadVerificada = !!identidad;
    }

    // Calcular totales sin IGV (0%)
    const total = this.toFloat(pedido.total);
    const opGravada = Number(total.toFixed(2));
    const igv = 0;

    // Get emisor info from environment variables
    const rucEmisor = process.env.RUC_EMISOR || '00000000000';
    const razonSocialEmisor =
      process.env.RAZON_SOCIAL_EMISOR || 'Delicias Bakery SAC';

    // Generar archivos representativos: PDF válido y XML mejorado
    try {
      // PDF válido con pdfkit - MEJORADO con detalles de productos
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const pdfStream = fs.createWriteStream(pdfAbs);
      doc.pipe(pdfStream);

      // Encabezado
      doc.fontSize(18).text('Comprobante electrónico', { align: 'right' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Tipo: ${params.comprobante_tipo.toUpperCase()}`);
      doc.text(`Serie: ${serie}`);
      doc.text(`Número: ${numero}`);
      doc.moveDown(0.5);

      // Datos del emisor
      doc.fontSize(12).text('Emisor:', { underline: true });
      doc.fontSize(10).text(`RUC: ${rucEmisor}`);
      doc.text(`Razón Social: ${razonSocialEmisor}`);
      doc.moveDown(0.5);

      // Datos del cliente
      doc.fontSize(12).text('Cliente:', { underline: true });
      if (params.tipo_documento === 'DNI') {
        doc.fontSize(10).text(`Documento: DNI ${params.numero_documento}`);
        doc.text(
          `Cliente: ${[identidad?.first_name, identidad?.first_last_name, identidad?.second_last_name].filter(Boolean).join(' ') || 'N/A'}`,
        );
        doc.text(`Verificado en RENIEC: ${identidad ? 'Sí' : 'No'}`);
      } else {
        doc.fontSize(10).text(`Documento: RUC ${params.numero_documento}`);
        doc.text(
          `Razón Social: ${identidad?.razon_social ?? identidad?.nombre_o_razon_social ?? 'N/A'}`,
        );
        doc.text(`Nombre Comercial: ${identidad?.nombre_comercial ?? 'N/A'}`);
        doc.text(
          `Estado/Condición SUNAT: ${identidad?.estado ?? identidad?.condicion ?? 'N/A'}`,
        );
      }

      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')}`);
      doc.moveDown(1);

      // Detalle de productos
      doc.fontSize(12).text('Detalle de Productos:', { underline: true });
      doc.moveDown(0.3);

      // Tabla header
      const tableTop = doc.y;
      doc.fontSize(9).text('Producto', 50, tableTop, { width: 200 });
      doc.text('Cantidad', 250, tableTop, { width: 60, align: 'center' });
      doc.text('P. Unit.', 310, tableTop, { width: 60, align: 'right' });
      doc.text('Subtotal', 370, tableTop, { width: 60, align: 'right' });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(430, tableTop + 15)
        .stroke();

      let yPos = tableTop + 20;
      pedido.detalles.forEach((detalle: any) => {
        const productoNombre =
          detalle.producto?.nombre || `Producto #${detalle.producto_id}`;
        doc.fontSize(9).text(productoNombre, 50, yPos, { width: 200 });
        doc.text(detalle.cantidad.toString(), 250, yPos, {
          width: 60,
          align: 'center',
        });
        doc.text(
          `S/ ${this.toFloat(detalle.precio_unitario).toFixed(2)}`,
          310,
          yPos,
          { width: 60, align: 'right' },
        );
        doc.text(`S/ ${this.toFloat(detalle.subtotal).toFixed(2)}`, 370, yPos, {
          width: 60,
          align: 'right',
        });
        yPos += 20;
      });

      doc.moveTo(50, yPos).lineTo(430, yPos).stroke();
      doc.moveDown(1);

      // Totales
      doc
        .fontSize(12)
        .text(`Subtotal: S/ ${opGravada.toFixed(2)}`, { align: 'right' });
      doc.text(`IGV (0%): S/ ${igv.toFixed(2)}`, { align: 'right' });
      doc
        .fontSize(14)
        .text(`Total: S/ ${total.toFixed(2)}`, { align: 'right' });

      doc.moveDown(1);
      doc
        .fontSize(10)
        .fillColor('gray')
        .text(
          `Esta es una representación impresa de la ${params.comprobante_tipo} electrónica generada por el sistema.`,
          { align: 'left' },
        );
      doc.fillColor('black');

      doc.end();

      // Esperar a que termine la escritura del PDF para asegurar que el archivo exista
      await new Promise<void>((resolve, reject) => {
        pdfStream.on('finish', () => resolve());
        pdfStream.on('error', (err) => reject(err));
      });

      // Validate PDF was created
      if (!fs.existsSync(pdfAbs)) {
        throw new Error('Failed to generate PDF file');
      }

      // XML mejorado con información completa
      const fechaEmision = new Date().toISOString();
      const nombreCliente =
        params.tipo_documento === 'DNI'
          ? [
              identidad?.first_name,
              identidad?.first_last_name,
              identidad?.second_last_name,
            ]
              .filter(Boolean)
              .join(' ')
          : (identidad?.razon_social ?? identidad?.nombre_o_razon_social ?? '');

      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xmlContent += `<Comprobante tipo="${params.comprobante_tipo}" serie="${serie}" numero="${numero}">\n`;
      xmlContent += `  <FechaEmision>${fechaEmision}</FechaEmision>\n`;
      xmlContent += `  <Emisor>\n`;
      xmlContent += `    <RUC>${rucEmisor}</RUC>\n`;
      xmlContent += `    <RazonSocial>${razonSocialEmisor}</RazonSocial>\n`;
      xmlContent += `  </Emisor>\n`;
      xmlContent += `  <Receptor>\n`;
      xmlContent += `    <TipoDocumento>${params.tipo_documento}</TipoDocumento>\n`;
      xmlContent += `    <NumeroDocumento>${params.numero_documento}</NumeroDocumento>\n`;
      xmlContent += `    <Nombre>${nombreCliente || 'N/A'}</Nombre>\n`;
      xmlContent += `  </Receptor>\n`;
      xmlContent += `  <Items>\n`;

      pedido.detalles.forEach((detalle: any, index: number) => {
        const productoNombre =
          detalle.producto?.nombre || `Producto #${detalle.producto_id}`;
        xmlContent += `    <Item linea="${index + 1}">\n`;
        xmlContent += `      <Descripcion>${productoNombre}</Descripcion>\n`;
        xmlContent += `      <Cantidad>${detalle.cantidad}</Cantidad>\n`;
        xmlContent += `      <PrecioUnitario>${this.toFloat(detalle.precio_unitario).toFixed(2)}</PrecioUnitario>\n`;
        xmlContent += `      <Subtotal>${this.toFloat(detalle.subtotal).toFixed(2)}</Subtotal>\n`;
        xmlContent += `    </Item>\n`;
      });

      xmlContent += `  </Items>\n`;
      xmlContent += `  <Totales>\n`;
      xmlContent += `    <OpGravada>${opGravada.toFixed(2)}</OpGravada>\n`;
      xmlContent += `    <IGV>${igv.toFixed(2)}</IGV>\n`;
      xmlContent += `    <Total>${total.toFixed(2)}</Total>\n`;
      xmlContent += `  </Totales>\n`;
      xmlContent += `</Comprobante>`;

      fs.writeFileSync(xmlAbs, Buffer.from(xmlContent, 'utf-8'));

      // Validate XML was created
      if (!fs.existsSync(xmlAbs)) {
        throw new Error('Failed to generate XML file');
      }

      // Imagen PNG generada a partir de SVG (visualización rápida para admin/cliente)
      const direccionCliente =
        params.tipo_documento === 'RUC'
          ? (identidad?.direccion ??
            identidad?.domicilio_fiscal ??
            identidad?.domicilio ??
            '')
          : '';
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 700 28px sans-serif; }
    .h2 { font: 600 20px sans-serif; }
    .label { font: 400 16px sans-serif; fill: #333 }
    .val { font: 600 16px sans-serif; }
    .muted { font: 400 14px sans-serif; fill: #666 }
    .box { fill: #f6f7f9; stroke: #ddd }
  </style>
  <rect x="20" y="20" width="960" height="660" class="box"/>
  <text x="40" y="60" class="title">Comprobante electrónico</text>
  <text x="40" y="100" class="label">Tipo:</text><text x="140" y="100" class="val">${params.comprobante_tipo.toUpperCase()}</text>
  <text x="40" y="130" class="label">Serie:</text><text x="140" y="130" class="val">${serie}</text>
  <text x="40" y="160" class="label">Número:</text><text x="140" y="160" class="val">${numero}</text>

  <text x="40" y="210" class="h2">Cliente</text>
  <text x="40" y="240" class="label">Documento:</text><text x="180" y="240" class="val">${params.tipo_documento} ${params.numero_documento}</text>
  <text x="40" y="270" class="label">Nombre/Razón social:</text><text x="260" y="270" class="val">${nombreCliente || 'N/A'}</text>
  ${params.tipo_documento === 'RUC' ? `<text x="40" y="300" class="label">Dirección:</text><text x="160" y="300" class="val">${(direccionCliente || '').replace(/&/g, '&amp;')}</text>` : ''}
  <text x="40" y="330" class="label">Verificado:</text><text x="160" y="330" class="val">${identidad ? 'Sí' : 'No'}</text>

  <text x="40" y="380" class="h2">Totales</text>
  <text x="40" y="410" class="label">Subtotal:</text><text x="260" y="410" class="val">S/ ${opGravada.toFixed(2)}</text>
  <text x="40" y="440" class="label">Total:</text><text x="260" y="440" class="val">S/ ${total.toFixed(2)}</text>

  <text x="40" y="530" class="label">Fecha de emisión:</text><text x="260" y="530" class="val">${new Date().toLocaleString('es-PE')}</text>
  <text x="40" y="570" class="muted">Esta imagen es una representación simplificada del comprobante electrónico. Revise el PDF para la versión completa.</text>
</svg>`;

      const svgBuf = Buffer.from(svg);
      await sharp(svgBuf).png().toFile(imgAbs);

      // Validate image was created
      if (!fs.existsSync(imgAbs)) {
        throw new Error('Failed to generate image file');
      }
    } catch (e) {
      console.error('Error generating invoice files:', e);
      return {
        status: 500,
        body: {
          error: 'Error al generar archivos',
          message:
            'Ocurrió un error al generar los archivos del comprobante. Por favor, intente nuevamente.',
        },
      };
    }

    // Upload files to Cloudinary in parallel
    let pdfPublic: string;
    let xmlPublic: string;
    let imgPublic: string;

    try {
      const uploadPromises = [
        this.uploadToCloudinary(
          pdfAbs,
          `pedido-${pedido.id}-${serie}-${numero}.pdf`,
          'raw',
        ),
        this.uploadToCloudinary(
          xmlAbs,
          `pedido-${pedido.id}-${serie}-${numero}.xml`,
          'raw',
        ),
        this.uploadToCloudinary(
          imgAbs,
          `pedido-${pedido.id}-${serie}-${numero}.png`,
          'image',
        ),
      ];

      const [pdfUrl, xmlUrl, imgUrl] = await Promise.all(uploadPromises);
      pdfPublic = pdfUrl;
      xmlPublic = xmlUrl;
      imgPublic = imgUrl;

      // Clean up temporary files
      try {
        fs.unlinkSync(pdfAbs);
        fs.unlinkSync(xmlAbs);
        fs.unlinkSync(imgAbs);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
        // Continue even if cleanup fails
      }
    } catch (uploadError) {
      console.error('Error uploading files to Cloudinary:', uploadError);
      return {
        status: 500,
        body: {
          error: 'Error al subir archivos',
          message:
            'Los archivos se generaron correctamente pero no se pudieron subir al almacenamiento. Por favor, intente nuevamente.',
        },
      };
    }

    const comprobante = {
      id: crypto.randomUUID(),
      tipo: params.comprobante_tipo,
      serie,
      numero,
      estado: 'emitido',
      pedido_id: pedido.id,
      total,
      totales: { op_gravada: opGravada, igv, total },
      cliente:
        params.tipo_documento === 'DNI'
          ? {
              tipo_documento: 'DNI',
              numero_documento: params.numero_documento,
              nombres: identidad?.first_name ?? null,
              primer_apellido: identidad?.first_last_name ?? null,
              segundo_apellido: identidad?.second_last_name ?? null,
              verificado: identidadVerificada,
            }
          : {
              tipo_documento: 'RUC',
              numero_documento: params.numero_documento,
              razon_social:
                identidad?.razon_social ??
                identidad?.nombre_o_razon_social ??
                null,
              nombre_comercial: identidad?.nombre_comercial ?? null,
              direccion:
                identidad?.direccion ??
                identidad?.domicilio_fiscal ??
                identidad?.domicilio ??
                null,
              condicion: identidad?.condicion ?? null,
              estado_sunat: identidad?.estado ?? null,
              verificado: identidadVerificada,
            },
      created_at: new Date().toISOString(),
    };

    // Persistir un registro simple en disco
    const jsonPath = path.join(folder, 'comprobantes.json');
    let list: any[] = [];
    try {
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, 'utf-8');
        list = JSON.parse(content);
      }
    } catch {}
    list.push({
      ...comprobante,
      archivos: { pdf: pdfPublic, xml: xmlPublic, img: imgPublic },
    });
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2));
    } catch {}

    return {
      status: 200,
      body: {
        comprobante,
        archivos: { pdf: pdfPublic, xml: xmlPublic, img: imgPublic },
      },
    };
  }

  async misComprobantes(usuarioId: number) {
    const folder = this.ensureFolder();
    const jsonPath = path.join(folder, 'comprobantes.json');
    try {
      if (!fs.existsSync(jsonPath))
        return { status: 200, body: { comprobantes: [] } };
      const content = fs.readFileSync(jsonPath, 'utf-8');
      const list: any[] = JSON.parse(content);
      // Filtrar por pedidos del usuario
      const pedidosIds = (
        await this.prisma.pedido.findMany({
          where: { usuario_id: usuarioId },
          select: { id: true },
        })
      ).map((p) => p.id);
      const filtrados = list.filter((c) => pedidosIds.includes(c.pedido_id));
      return { status: 200, body: { comprobantes: filtrados } };
    } catch (e) {
      return { status: 200, body: { comprobantes: [] } };
    }
  }

  // ADMIN: listar todos los comprobantes
  async adminComprobantes(params: {
    pagina?: number;
    limite?: number;
    tipo?: 'boleta' | 'factura';
    estado?: string;
  }) {
    const folder = this.ensureFolder();
    const jsonPath = path.join(folder, 'comprobantes.json');
    try {
      if (!fs.existsSync(jsonPath))
        return {
          status: 200,
          body: { comprobantes: [], total: 0, pagina: 1, totalPaginas: 1 },
        };
      const content = fs.readFileSync(jsonPath, 'utf-8');
      let list: any[] = JSON.parse(content);
      if (params.tipo) list = list.filter((c) => c.tipo === params.tipo);
      if (params.estado)
        list = list.filter(
          (c) =>
            String(c.estado).toLowerCase() ===
            String(params.estado).toLowerCase(),
        );
      const total = list.length;
      const pagina = params.pagina && params.pagina > 0 ? params.pagina : 1;
      const limite = params.limite && params.limite > 0 ? params.limite : 20;
      const start = (pagina - 1) * limite;
      const end = start + limite;
      const paginados = list.slice(start, end);
      const totalPaginas = Math.max(1, Math.ceil(total / limite));
      return {
        status: 200,
        body: { comprobantes: paginados, total, pagina, totalPaginas },
      };
    } catch (e) {
      return {
        status: 200,
        body: { comprobantes: [], total: 0, pagina: 1, totalPaginas: 1 },
      };
    }
  }
}
