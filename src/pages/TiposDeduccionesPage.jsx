import { MinusCircledIcon } from '@radix-ui/react-icons'

function TiposDeduccionesPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-8 px-8 pt-4 pb-8">

        {/* Header: título + breadcrumbs */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Tipos de Deducciones</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Modulo</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Tipos de Deducciones</span>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default TiposDeduccionesPage
