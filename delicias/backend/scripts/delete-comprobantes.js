const fs = require('fs');
const path = require('path');

// IDs de los comprobantes a eliminar (basados en el número de serie)
const numerosAEliminar = ['256748', '775516', '106712', '912674', '743261', '848775', '995733'];

const comprobantesPath = path.join(__dirname, '../uploads/comprobantes/comprobantes.json');
const uploadsDir = path.join(__dirname, '../uploads/comprobantes');

try {
  // Leer el archivo JSON
  const data = fs.readFileSync(comprobantesPath, 'utf8');
  const comprobantes = JSON.parse(data);

  console.log(`Total de comprobantes antes: ${comprobantes.length}`);

  // Filtrar y eliminar archivos
  const comprobantesAMantener = comprobantes.filter((comp) => {
    const debeEliminar = numerosAEliminar.includes(comp.numero);
    
    if (debeEliminar) {
      console.log(`\nEliminando: B001-${comp.numero} (Pedido ${comp.pedido_id})`);
      
      // Eliminar archivos físicos si existen
      if (comp.archivos) {
        ['pdf', 'xml', 'img'].forEach((tipo) => {
          if (comp.archivos[tipo]) {
            const archivoPath = path.join(uploadsDir, path.basename(comp.archivos[tipo]));
            try {
              if (fs.existsSync(archivoPath)) {
                fs.unlinkSync(archivoPath);
                console.log(`  ✓ Eliminado: ${tipo.toUpperCase()}`);
              }
            } catch (err) {
              console.log(`  ✗ Error al eliminar ${tipo}: ${err.message}`);
            }
          }
        });
      }
    }
    
    return !debeEliminar;
  });

  console.log(`\nTotal de comprobantes después: ${comprobantesAMantener.length}`);
  console.log(`Comprobantes eliminados: ${comprobantes.length - comprobantesAMantener.length}`);

  // Guardar el archivo actualizado
  fs.writeFileSync(comprobantesPath, JSON.stringify(comprobantesAMantener, null, 2), 'utf8');
  console.log('\n✓ Archivo comprobantes.json actualizado correctamente');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
