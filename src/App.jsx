import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EmpleadosPage from './pages/EmpleadosPage.jsx'
import TiposIngresosPage from './pages/TiposIngresosPage.jsx'
import TiposDeduccionesPage from './pages/TiposDeduccionesPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="empleados" element={<EmpleadosPage />} />
          <Route path="tipos-ingresos" element={<TiposIngresosPage />} />
          <Route path="tipos-deducciones" element={<TiposDeduccionesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
