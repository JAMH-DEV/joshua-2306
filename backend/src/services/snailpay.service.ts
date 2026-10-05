import { randomUUID, randomBytes } from 'node:crypto'
import type { User } from '../types/user.types.js'
import { ApiError } from '../utils/api-error.js'
interface PaymentInput {
  card_number: string; expiration_date: string; cvv: string; full_name: string
  transaction_amount: number; payer_id: string; payer_email: string
}
// La referencia permite reintentar sin duplicar una recarga ya aprobada
const operations = new Map<string, { fingerprint: string; httpStatus: number; body: Record<string, unknown> }>()
export function charge(user: User, input: PaymentInput, reference: string) {
  if (!reference || reference.length > 100) throw new ApiError(400, 'Falta una referencia de operación válida')
  const data = input ?? {} as PaymentInput
  const key = `${user.id}:${reference}`
  const fingerprint = JSON.stringify(data)
  const previous = operations.get(key)
  if (previous) {
    if (previous.fingerprint !== fingerprint) throw new ApiError(409, 'La referencia ya se utilizó con otros datos')
    return { ...previous, body: { ...previous.body, balance: user.balance } }
  }
  const card = typeof data.card_number === 'string' ? data.card_number.replace(/\s/g, '') : ''
  const cvv = typeof data.cvv === 'string' ? data.cvv : ''
  const amount = data.transaction_amount
  let status = 'approved', detail = 'Pago aprobado. Tu saldo fue actualizado', httpStatus = 200
  const reject = (message: string, code = 422) => { status = 'rejected'; detail = message; httpStatus = code }
  if (data.payer_id !== user.id || data.payer_email !== user.email) reject('El pagador no coincide con la sesión activa', 403)
  else if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 100000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) reject('Ingresa un monto entre $0.01 y $100,000 con máximo dos decimales')
  else if (typeof data.full_name !== 'string' || !data.full_name.trim() || data.full_name.length > 120 || !/^\d{16}$/.test(card) || !/^\d{3}$/.test(cvv) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiration_date ?? '')) reject('Revisa el nombre, tarjeta, vencimiento (MM/AA) y CVV')
  else if (card === '5000500050005000' || process.env.SNAILPAY_SYSTEM_ERROR === 'true') { status = 'error'; detail = 'SnailPay no está disponible. No se aplicó ninguna recarga'; httpStatus = 503 }
  else if (card !== '1234123412341234' || data.expiration_date !== '12/26' || cvv !== '543') reject('Tarjeta rechazada. Usa los datos ficticios de aprobación')
  // Sólo un resultado aprobado cambia el saldo. Usamos centavos para sumar dinero.
  if (status === 'approved') user.balance = (Math.round(user.balance * 100) + Math.round(amount * 100)) / 100
  const body = { id: randomUUID(), status, status_detail: detail,
    transaction_amount: typeof amount === 'number' && Number.isFinite(amount) ? amount : null,
    date_created: new Date().toISOString(), authorization_code: status === 'approved' ? randomBytes(4).toString('hex').toUpperCase() : null,
    reference, payer_id: user.id, payer_email: user.email,
    // Son datos ficticios, devueltos y guardados en el navegador para el ejercicio.
    card_number: card, cvv, balance: user.balance }
  const result = { fingerprint, httpStatus, body }
  operations.set(key, result)
  return result
}
