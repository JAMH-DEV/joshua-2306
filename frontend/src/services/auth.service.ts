import { request, saveProfile, clearSession } from './api'
import type { Profile } from './api'
interface LoginData { email: string; password: string }
interface RegisterData extends LoginData { fullName: string }
export async function login(data: LoginData) {
  const result = await request<{ user: Profile; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) })
  localStorage.setItem('token', result.token)
  saveProfile(result.user)
  return result
}
export async function register(data: RegisterData) {
  const result = await request<{ user: Profile }>('/auth/register', { method: 'POST', body: JSON.stringify(data) })
  localStorage.setItem('profile', JSON.stringify(result.user))
  return result
}
export async function logout() {
  try { await request<void>('/auth/logout', { method: 'POST' }) }
  finally { clearSession() }
}
