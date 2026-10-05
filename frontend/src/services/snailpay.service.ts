import { ApiError, request } from './api'
import type { PaymentInput, PaymentResult } from './api'
// Tanto aprobaciones como rechazos se guardan con tarjeta y CVV ficticios.
export async function pay(data: PaymentInput, reference: string): Promise<PaymentResult> {
  let result: PaymentResult
  try {
    result = await request<PaymentResult>('/snailpay/charges', { method: 'POST', headers: { 'Idempotency-Key': reference }, body: JSON.stringify(data) })
  } catch (error) {
    if (!(error instanceof ApiError) || !error.data || typeof error.data !== 'object' || !('status_detail' in error.data)) throw error
    result = error.data as PaymentResult
  }
  const key = `snailpay:${data.payer_id}`
  let history: PaymentResult[] = []
  try { history = JSON.parse(localStorage.getItem(key) ?? '[]') } catch { /* Recuperamos un historial corrupto. */ }
  if (!Array.isArray(history)) history = []
  localStorage.setItem(key, JSON.stringify([result, ...history.filter(item => item.id !== result.id)].slice(0, 50)))
  return result
}
