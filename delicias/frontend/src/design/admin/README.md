# Diseño del Panel de Administración

Este módulo concentra el diseño del panel de administración: componentes, estilos y assets visuales.

## Estructura

```
src/design/admin/
├── components/       # Componentes de UI del panel
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Shell.tsx
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── StatusBadge.tsx
│   ├── MetricCard.tsx
│   └── Table.tsx
├── styles/           # Estilos del módulo admin
│   ├── tokens.css    # Variables/tokens de diseño
│   └── README.md
├── assets/           # Assets de diseño (fuentes originales, SVG)
│   ├── icons/
│   ├── images/
│   └── illustrations/
└── index.ts          # Reexporta componentes para `@/design/admin`
```

Para assets estáticos servidos por la app, usa `public/images/admin/`.

## Uso

Importación desde el barrel:

```tsx
import { AdminShell, MetricCard, StatsGrid, Badge, Alert, StatusBadge, Table, THead, Th, TBody, Tr, Td, AdminButton, buttonClasses } from "@/design/admin";
```

## Beneficios
- Organización clara y separada del resto de la app.
- Mantenimiento más simple y escalable.
- Punto único para evolucionar el diseño (modo oscuro, tokens, iconos, etc.).