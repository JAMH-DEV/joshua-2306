import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Snail, CreditCard, CalendarDays, LockKeyhole, User, DollarSign } from 'lucide-react'
import Input from './Input'
import TransactionLoader from './TransactionLoader'
import { ApiError } from '../services/api'
import type { Profile, PaymentInput, PaymentResult } from '../services/api'
import { pay } from '../services/snailpay.service'
interface Props {
  isOpen: boolean; setIsOpen: (value: boolean) => void; profile: Profile
  onBalanceChange: (balance: number) => void; onSessionExpired: () => void
}
function SnailPayDrawer({ isOpen, setIsOpen, profile, onBalanceChange, onSessionExpired }: Props) {
  const [card, setCard] = useState('')
  const [expiration, setExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState(profile.fullName)
  const [amount, setAmount] = useState('100')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<PaymentResult | null>(null)
  // Un timeout conserva la referencia; reintentar el mismo pago no duplica el saldo.
  const pending = useRef<{ fingerprint: string; reference: string } | null>(null)
  const submitting = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const data = { card_number: card, expiration_date: expiration, cvv, full_name: name,
      transaction_amount: Number(amount), payer_id: profile.id, payer_email: profile.email }
    await processPayment(data)
  }
  async function processPayment(data: PaymentInput) {
    if (submitting.current) return
    const fingerprint = JSON.stringify(data)
    if (pending.current && pending.current.fingerprint !== fingerprint) {
      setMessage('Primero reintenta con los datos del pago pendiente para confirmar su resultado'); return
    }
    pending.current ??= { fingerprint, reference: crypto.randomUUID() }
    submitting.current = true; setBusy(true); setMessage(''); setResult(null)
    // El loader dura al menos tres segundos; si el API tarda más, sigue visible.
    const minimumDelay = new Promise<void>(resolve => window.setTimeout(resolve, 3000))
    try {
      const response = await pay(data, pending.current.reference)
      await minimumDelay
      setResult(response); setMessage(response.status_detail)
      // El servidor es quien calcula el saldo; el navegador sólo guarda su respuesta.
      onBalanceChange(response.balance)
      pending.current = null
    } catch (error) {
      await minimumDelay
      setMessage(error instanceof Error ? error.message : 'No se pudo completar la recarga')
      if (error instanceof ApiError) {
        pending.current = null
        if (error.status === 401) onSessionExpired()
      }
    } finally {
      // Limpiamos todos los campos cuando se retira el loader, conservando el resultado.
      setCard(''); setExpiration(''); setCvv(''); setName(''); setAmount('')
      submitting.current = false; setBusy(false)
    }
  }
  function example(number: string) {
    if (pending.current) { setMessage('Reintenta primero el pago pendiente'); return }
    setCard(number); setExpiration('12/26'); setCvv('543'); setName(profile.fullName)
  }
  return <>
    {busy && <TransactionLoader />}
    <button type="button" disabled={busy} aria-label={isOpen ? 'Cerrar SnailPay' : 'Abrir SnailPay'} onClick={() => setIsOpen(!isOpen)} className={`fixed top-1/2 -translate-y-1/2 z-50 w-14 h-20 flex flex-col items-center justify-center rounded-l-2xl bg-zinc-900 text-emerald-400 border border-emerald-500/30 ${isOpen ? 'right-96' : 'right-0'}`}>
      <Snail size={25} />{isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
    </button>
    <aside aria-label="SnailPay" aria-hidden={!isOpen} inert={!isOpen} className={`fixed top-0 right-0 z-40 h-screen w-96 bg-zinc-950 border-l border-white/10 shadow-2xl transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-emerald-400 flex gap-3"><Snail /> SNAILPAY</h2>
        <p className="text-xs text-slate-400">Pago simulado. Utiliza exclusivamente datos ficticios.</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button type="button" disabled={busy} onClick={() => example('1234123412341234')} className="p-2 rounded border border-emerald-500/30">Ejemplo aprobado</button>
          <button type="button" disabled={busy} onClick={() => example('4000400040004000')} className="p-2 rounded border border-white/20">Rechazo</button>
          <button type="button" disabled={busy} onClick={() => example('5000500050005000')} className="p-2 rounded border border-white/20">Error interno</button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <fieldset disabled={busy} className="flex flex-col gap-4">
            <Input label="Número de tarjeta" type="text" placeholder="1234 1234 1234 1234" icon={<CreditCard />} height="h-16" value={card} onChange={e => setCard(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Vencimiento" type="text" placeholder="12/26" icon={<CalendarDays />} height="h-16" value={expiration} onChange={e => setExpiration(e.target.value)} />
              <Input label="CVV" type="password" placeholder="543" icon={<LockKeyhole />} height="h-16" value={cvv} onChange={e => setCvv(e.target.value)} />
            </div>
            <Input label="Nombre completo" type="text" placeholder="Tu nombre" icon={<User />} height="h-16" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Monto a recargar" type="number" placeholder="100.00" icon={<DollarSign />} height="h-16" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0.01" max="100000" />
            <div className="grid grid-cols-4 gap-2">{[50, 100, 200, 500].map(value => <button type="button" key={value} className="p-2 rounded border border-white/10" onClick={() => setAmount(String(value))}>${value}</button>)}</div>
          </fieldset>
          {message && <p role="status" className={`text-sm ${result?.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>}
          {!busy && pending.current && <button type="button" className="rounded-xl border border-emerald-400 p-3 text-emerald-400" onClick={() => {
            // Aunque el formulario quedó vacío, repetimos la operación original con la misma referencia.
            if (pending.current) void processPayment(JSON.parse(pending.current.fingerprint) as PaymentInput)
          }}>Reintentar transacción pendiente</button>}
          {result?.status === 'approved' && <p className="text-xs text-slate-400">Autorización: {result.authorization_code}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={busy} className="h-12 rounded-xl border border-white/15" onClick={() => setIsOpen(false)}>Cerrar</button>
            <button type="submit" disabled={busy} className="h-12 rounded-xl bg-emerald-400 text-emerald-950 font-bold disabled:opacity-50">{busy ? 'Procesando...' : 'Recargar saldo'}</button>
          </div>
        </form>
      </div>
    </aside>
  </>
}
export default SnailPayDrawer
