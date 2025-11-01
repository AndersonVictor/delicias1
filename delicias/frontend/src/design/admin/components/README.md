# Componentes del Panel de Administración

Esta carpeta contiene todos los componentes de UI del panel de administración.

Convenciones:
- Componentes en PascalCase: `Header.tsx`, `Sidebar.tsx`, `Shell.tsx`, etc.
- Cada componente debe ser autocontenido (props claras y sin efectos colaterales).
- Si un componente requiere estilos propios, usar CSS Modules en `../styles` o clases utilitarias.

Exportación:
- Los componentes se reexportan desde `src/design/admin/index.ts` para importar como `@/design/admin`.