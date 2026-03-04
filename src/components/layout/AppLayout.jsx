import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-grey-100">

      {/* El botón de toggle vive DENTRO del Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>
  )
}

export default AppLayout
