import type { Request, Response } from 'express'
import { loginUser, registerUser, publicUser, sessionUser, logoutUser } from '../services/auth.service.js'
// Express 5 dirige los errores al middleware central de app.ts.
export function register(req: Request, res: Response) { res.status(201).json({ message: 'Usuario registrado correctamente', user: registerUser(req.body) }) }
export function login(req: Request, res: Response) { res.json({ message: 'Inicio de sesión correcto', ...loginUser(req.body) }) }
export function me(req: Request, res: Response) { res.json({ user: publicUser(sessionUser(req.headers.authorization)) }) }
export function logout(req: Request, res: Response) { logoutUser(req.headers.authorization); res.status(204).end() }
