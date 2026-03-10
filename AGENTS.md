# AGENTS.md — NominaManager UI

Guía para agentes de IA que trabajen en este proyecto. Leé esto antes de tocar cualquier archivo.

---

## Stack

| Tecnología | Versión | Notas |
|---|---|---|
| React | 19 | Sin `useMemo`/`useCallback` innecesarios — el compilador los maneja |
| Vite | 7 | Entry point: `src/main.jsx` |
| Tailwind CSS | 4 | Sin `tailwind.config.js` — se configura en `src/index.css` |
| Radix UI | `radix-ui` 1.4 (umbrella) | Importar desde `'radix-ui'`, NO desde `'@radix-ui/react-*'` |
| Radix Icons | `@radix-ui/react-icons` 1.3 | Paquete separado del umbrella |
| React Router | 7 | App Router con `createBrowserRouter` en `App.jsx` |
| Axios | 1.13 | En `src/services/` |

---

## Estructura del proyecto

```
src/
├── index.css           ← tokens de color (@theme), reset base
├── main.jsx            ← entry point
├── App.jsx             ← rutas
├── components/
│   └── layout/
│       ├── AppLayout.jsx   ← layout raíz: sidebar + main
│       └── Sidebar.jsx     ← sidebar colapsable
├── pages/
│   ├── DashboardPage.jsx
│   ├── EmpleadosPage.jsx
│   ├── TiposIngresosPage.jsx
│   └── TiposDeduccionesPage.jsx
├── services/           ← llamadas HTTP con axios
├── hooks/              ← custom hooks
├── lib/                ← utilidades
└── types/              ← tipos TypeScript/JSDoc
```

---

## Radix UI — Reglas críticas

### Importar del umbrella `'radix-ui'`, nunca del paquete individual

```jsx
// ✅ CORRECTO
import { Separator, Dialog, Tooltip } from 'radix-ui'

// ❌ NUNCA — el paquete individual no está instalado
import { Separator } from '@radix-ui/react-separator'
import * as Dialog from '@radix-ui/react-dialog'
```

### Importar íconos de `'@radix-ui/react-icons'` — paquete SEPARADO

```jsx
// ✅ CORRECTO — es un paquete distinto al umbrella
import { DashboardIcon, PersonIcon, ChevronLeftIcon } from '@radix-ui/react-icons'

// ❌ NUNCA — los íconos no están en el umbrella
import { DashboardIcon } from 'radix-ui'
```

### Usar los subcomponentes con notación de punto

```jsx
// ✅ Así usan los primitivos del umbrella
<Separator.Root className="h-px bg-grey-600" />
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content />
  </Dialog.Portal>
</Dialog.Root>
```

---

## Tailwind CSS v4 — Reglas críticas

### Sin `tailwind.config.js` — los tokens van en `src/index.css`

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary-400: #008080;
  --color-grey-700: #111212;
  /* ... */
}
```

### Nunca usar `var()` ni hex en `className`

```jsx
// ✅ CORRECTO — clase semántica del tema
<div className="bg-primary-400 text-grey-100" />

// ❌ NUNCA — var() en className
<div className="bg-[var(--color-primary-400)]" />

// ❌ NUNCA — hex en className
<div className="bg-[#008080]" />
```

### `style={{}}` solo para valores verdaderamente dinámicos

```jsx
// ✅ OK — valor computado en runtime
<nav style={{ width: collapsed ? 112 : 240 }} />
<div style={{ opacity: collapsed ? 0 : 1 }} />

// ✅ OK — box-shadow que no existe como clase Tailwind
<button style={{ boxShadow: '0px 8px 32px 0px rgba(206,212,218,0.15)' }} />

// ❌ NO — valor estático que tiene clase Tailwind equivalente
<div style={{ backgroundColor: '#008080' }} />
```

### No existe `cn()` en el proyecto — usar template literals o concatenación

```jsx
// ✅ Así se hace actualmente
className={`flex items-center ${collapsed ? 'w-12 justify-center' : 'w-full px-3'}`}

// Si la complejidad lo justifica, podés instalar clsx + tailwind-merge y crear cn()
// pero no está instalado aún — no asumas que existe
```

---

## Paleta de colores

Todos los tokens están definidos en `src/index.css`. Esta es la paleta completa:

### Primary — Teal/Cyan (acento principal)
| Token | Hex | Uso típico |
|---|---|---|
| `primary-100` | `#00ffff` | — |
| `primary-200` | `#00d3d3` | — |
| `primary-300` | `#00a9a9` | — |
| `primary-400` | `#008080` | **Activo, botones, logo** |
| `primary-500` | `#005a5a` | Hover sobre primario |
| `primary-600` | `#003636` | — |
| `primary-700` | `#001515` | — |

### Secondary
| Token | Hex |
|---|---|
| `secondary-100` | `#60fefe` |
| `secondary-200` | `#23d5d5` |
| `secondary-300` | `#1aabab` |
| `secondary-400` | `#118282` |
| `secondary-500` | `#095c5c` |
| `secondary-600` | `#033838` |
| `secondary-700` | `#011717` |

### Tertiary / Quaternary
| Token | Hex |
|---|---|
| `tertiary-300` | `#39aaaa` |
| `quaternary-500` | `#395555` |

### Grey (escala de grises teal-tinted)
| Token | Hex | Uso típico |
|---|---|---|
| `grey-100` | `#e0e7e7` | Fondo de la app (`bg-grey-100`) |
| `grey-200` | `#b9bfbf` | Bordes suaves |
| `grey-300` | `#939898` | Texto nav inactivo |
| `grey-400` | `#707373` | Texto muted, breadcrumbs, subtítulos |
| `grey-500` | `#4e5050` | Bordes sidebar |
| `grey-600` | `#2e3030` | Separadores sidebar, hover nav |
| `grey-700` | `#111212` | **Fondo sidebar** |

### Nunca usar colores de Tailwind por defecto para UI propia
```jsx
// ❌ NO — rompería la coherencia de la paleta
<div className="bg-indigo-600" />
<div className="bg-slate-900" />
<p className="text-gray-500" />

// ✅ Usar siempre los tokens del proyecto
<div className="bg-primary-400" />
<div className="bg-grey-700" />
<p className="text-grey-400" />
```

---

## Layout general

```
┌─────────────────────────────────────────────────┐
│  AppLayout (flex-row, min-h-screen, bg-grey-100) │
│  ┌──────────────┐  ┌───────────────────────────┐ │
│  │   Sidebar    │  │          <main>            │ │
│  │  (sticky,    │  │   flex-1, overflow-auto    │ │
│  │  240/112px)  │  │                            │ │
│  │              │  │  Cada página gestiona      │ │
│  │              │  │  su propio padding         │ │
│  └──────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **El `AppLayout` NO agrega padding al `<main>`** — cada página define el suyo
- El sidebar es `sticky top-0` con `min-h-screen`
- El toggle de colapso vive DENTRO del `Sidebar`, que recibe `collapsed` y `onToggle` como props desde `AppLayout`

---

## Estructura de una página

```jsx
function MiPagina() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-8 px-8 pt-4 pb-8">

        {/* Título + breadcrumbs */}
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Nombre del Módulo</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Dashboard</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Nombre del Módulo</span>
          </nav>
        </div>

        {/* Contenido */}
        ...

      </div>
    </div>
  )
}
```

- **Dashboard** no tiene breadcrumb padre — solo muestra `<span className="text-grey-400">Dashboard</span>`
- Los demás módulos muestran `Dashboard / Nombre del Módulo`

---

## Sidebar — comportamiento

- **Expandido**: `width: 240px`
- **Colapsado**: `width: 112px`
- El botón de toggle es un cuadrado `40×40px`, `border-radius: 8px`, fondo blanco con sombra `rgba(206,212,218,0.15)`
- Cuando expandido: botón con `ChevronLeftIcon` a la derecha del logo en el header
- Cuando colapsado: logo centrado, botón con `ChevronRightIcon` debajo
- Las labels de los nav items se animan con `maxWidth` + `opacity` — NO usar `overflow-hidden` en el `<nav>` ni en el `<NavLink>` porque corta el texto
- El `overflow-x-hidden` va en el contenedor interior del nav (el `div` con `flex-1`), no en el `<nav>` raíz

---

## Convenciones de código

- **Sin `useMemo` / `useCallback`** a menos que sea estrictamente necesario — React 19 + compilador los optimiza
- **Comentarios en español** para bloques estructurales (`{/* ── Header ── */}`)
- **JSDoc** para tipar arrays/objetos complejos cuando no hay TypeScript explícito
- **Sin CSS custom** fuera de `index.css` — todo con clases Tailwind o `style={{}}` para valores dinámicos
- **Sin archivos `.module.css`** — el proyecto no usa CSS Modules

---

## Comandos útiles

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción (verificar antes de cada commit)
npm run lint     # ESLint
npm run preview  # preview del build
```

**Siempre correr `npm run build` al terminar** para verificar que no hay errores de compilación.
