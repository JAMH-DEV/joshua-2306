import type { User } from '../types/user.types.js'
// Caché en RAM: todos estos datos se borran al reiniciar Express.
export const users: User[] = []
export interface Session { token: string; userId: string; expiresAt: number }
export const sessions: Session[] = []
