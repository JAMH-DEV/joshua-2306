export interface Profile { id: string; fullName: string; email: string; balance: number }
export interface Snail { id: string; name: string; wins: number; chartColor: string; iconColor: string }
export interface DashboardData { won: number; lost: number; snails: Snail[]; races: (Omit<Snail, 'wins'> & { raceNumber: number })[] }
export interface PaymentInput {
  card_number: string; expiration_date: string; cvv: string; full_name: string
  transaction_amount: number; payer_id: string; payer_email: string
}
export interface PaymentResult {
  id: string; status: 'approved' | 'rejected' | 'error'; status_detail: string
  transaction_amount: number | null; date_created: string; authorization_code: string | null
  reference: string; payer_id: string; payer_email: string; card_number: string; cvv: string; balance: number
}
export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, message: string, data?: unknown) { super(message); this.status = status; this.data = data }
}
export function clearSession() { localStorage.removeItem('token'); localStorage.removeItem('session') }
export function saveProfile(profile: Profile) { localStorage.setItem('profile', JSON.stringify(profile)); localStorage.setItem('session', JSON.stringify(profile)) }
// El proxy de Vite conecta /api con Express. En otro entorno se puede configurar VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL ?? '/api'
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10000)
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
    if (response.status === 204) return undefined as T
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 401) clearSession()
      throw new ApiError(response.status, data.status_detail ?? data.message ?? 'No se pudo completar la solicitud', data)
    }
    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof Error && error.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Reintenta para consultar el resultado sin duplicar la recarga', { cause: error })
    throw new Error('No se pudo conectar con el backend. Verifica que esté ejecutándose', { cause: error })
  } finally { window.clearTimeout(timeout) }
}

