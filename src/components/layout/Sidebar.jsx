import { NavLink } from 'react-router-dom'
import { Separator } from 'radix-ui'
import {
  DashboardIcon,
  PersonIcon,
  LayersIcon,
  MixerHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightIcon,
} from '@radix-ui/react-icons'

/** @type {{ label: string, path: string, icon: import('react').ReactNode }[]} */
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <DashboardIcon width={20} height={20} />,
  },
  {
    label: 'Empleados',
    path: '/empleados',
    icon: <PersonIcon width={20} height={20} />,
  },
  {
    label: 'Ing. y Ded.',
    path: '/tipos-ingresos',
    icon: <MixerHorizontalIcon width={20} height={20} />,
  },
  {
    label: 'Transacciones',
    path: '/transacciones',
    icon: <ArrowTopRightIcon width={20} height={20} />,
  },
]

function Sidebar({ collapsed, onToggle }) {
  return (
    <nav
      className="flex flex-col flex-shrink-0 min-h-screen sticky top-0 bg-grey-700 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 112 : 240 }}
    >

      {/* ── Header ── */}
      <div
        className="flex flex-shrink-0 items-center gap-2 pt-8 pb-4 px-8"
        style={{ minHeight: 64 }}
      >
        {collapsed ? (
          /* Collapsed: logo centrado + botón abajo */
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-9 h-9 bg-primary-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <LayersIcon width={18} height={18} color="white" />
            </div>
            <button
              onClick={onToggle}
              aria-label="Expandir sidebar"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-grey-600 cursor-pointer transition-colors duration-150 hover:bg-grey-100"
              style={{ boxShadow: '0px 8px 32px 0px rgba(206,212,218,0.15)' }}
            >
              <ChevronRightIcon width={16} height={16} />
            </button>
          </div>
        ) : (
          /* Expanded: logo + nombre + botón de colapso a la derecha */
          <>
            <div className="w-9 h-9 bg-primary-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <LayersIcon width={18} height={18} color="white" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <p className="m-0 text-sm font-bold text-white leading-tight whitespace-nowrap">Nóminas</p>
              <p className="m-0 text-xs text-grey-400 leading-tight">Módulo</p>
            </div>
            <button
              onClick={onToggle}
              aria-label="Colapsar sidebar"
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white text-grey-600 cursor-pointer transition-colors duration-150 hover:bg-grey-100"
              style={{ boxShadow: '0px 8px 32px 0px rgba(206,212,218,0.15)' }}
            >
              <ChevronLeftIcon width={16} height={16} />
            </button>
          </>
        )}
      </div>

      <Separator.Root className="h-px bg-grey-600 border-0 flex-shrink-0" />

      {/* ── Nav ── */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden py-4 gap-6">

        {/* Sección Gestión */}
        <div className="flex flex-col gap-1">

          {/* Label sección — se oculta al colapsar */}
          <div
            className="overflow-hidden transition-all duration-200 ease-in-out"
            style={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
          >
            <p className="m-0 mb-1 px-4 text-[11px] font-semibold uppercase tracking-widest text-grey-400">
              Gestión
            </p>
          </div>

          {/* Lista de items */}
          <ul
            className={`list-none p-0 m-0 flex flex-col gap-0.5 px-4 ${collapsed ? 'items-center' : ''}`}
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className="w-full flex justify-center">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center h-12 rounded-lg no-underline transition-colors duration-150 ${
                      collapsed ? 'w-12 justify-center' : 'w-full px-3 gap-2'
                    } ${
                      isActive
                        ? 'bg-primary-400 text-white'
                        : 'text-grey-300 hover:bg-grey-600 hover:text-white'
                    }`
                  }
                >
                  {/* Ícono siempre visible */}
                  <span className="flex items-center justify-center flex-shrink-0 w-5 h-5">
                    {item.icon}
                  </span>

                  {/* Label — animada al colapsar */}
                  <span
                    className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 200,
                    }}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <Separator.Root className="h-px bg-grey-600 border-0 flex-shrink-0" />

      {/* ── Footer / versión ── */}
      <div
        className="h-12 flex items-center px-8 flex-shrink-0 overflow-hidden transition-all duration-200 ease-in-out"
        style={{ opacity: collapsed ? 0 : 1 }}
      >
        <p className="m-0 text-[11px] text-grey-400 whitespace-nowrap">
          v1.0.0 · Sistema de Nóminas
        </p>
      </div>

    </nav>
  )
}

export default Sidebar
