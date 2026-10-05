import { LoaderCircle } from 'lucide-react'

// Cubre SnailPay mientras esperamos el resultado y bloquea nuevas operaciones.
function TransactionLoader() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Procesando transacción">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
        <LoaderCircle size={48} className="animate-spin text-emerald-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white">Procesando transacción</h3>
        <p className="text-sm text-slate-400">Espera unos segundos mientras consultamos el resultado.</p>
      </div>
    </div>
  )
}

export default TransactionLoader
