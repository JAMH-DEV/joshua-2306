import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { users, sessions } from '../data/memory.store.js'
import type { User, RegisterUserInput, LoginInput } from '../types/user.types.js'
import { ApiError } from '../utils/api-error.js'

// El navegador recibe el perfil, nunca el hash de contraseña.
export function publicUser(user: User) {
  return { id: user.id, fullName: user.fullName, email: user.email, balance: user.balance, createdAt: user.createdAt }
}
export function registerUser(data: RegisterUserInput) {
  const { fullName, email, password } = data ?? {}
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 120 ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(400, 'Nombre válido, correo válido y contraseña de 8 a 128 caracteres son obligatorios')
  }
  const normalizedEmail = email.trim().toLowerCase()
  if (users.some(user => user.email === normalizedEmail)) throw new ApiError(409, 'El correo ya está registrado')
  // La sal hace que contraseñas iguales tengan hashes distintos.
  const salt = randomBytes(16).toString('hex')
  const user: User = { id: randomUUID(), fullName: fullName.trim(), email: normalizedEmail,
    password: `${salt}:${scryptSync(password, salt, 64).toString('hex')}`, balance: 0, createdAt: new Date() }
  users.push(user)
  return publicUser(user)
}
export function loginUser(data: LoginInput) {
  if (typeof data?.email !== 'string' || typeof data?.password !== 'string' || data.password.length > 128) throw new ApiError(400, 'Correo y contraseña son obligatorios')
  const user = users.find(user => user.email === data.email.trim().toLowerCase())
  if (!user) throw new ApiError(401, 'Correo o contraseña incorrectos')
  const [salt, hash] = user.password.split(':')
  if (!timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(data.password, salt, 64))) throw new ApiError(401, 'Correo o contraseña incorrectos')
  const token = randomBytes(32).toString('hex')
  sessions.push({ token, userId: user.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  return { user: publicUser(user), token }
}
export function sessionUser(authorization?: string) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const session = sessions.find(session => session.token === token && session.expiresAt > Date.now())
  const user = session && users.find(user => user.id === session.userId)
  if (!user) throw new ApiError(401, 'La sesión expiró. Inicia sesión nuevamente')
  return user
}
export function logoutUser(authorization?: string) {
  sessionUser(authorization)
  sessions.splice(sessions.findIndex(session => session.token === authorization?.slice(7)), 1)
}
