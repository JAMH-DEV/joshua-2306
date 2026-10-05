import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import authRoutes from './routes/auth.routes.js'
import { sessionUser } from './services/auth.service.js'
import { dashboardData } from './services/dashboard.service.js'
import { charge } from './services/snailpay.service.js'
import { ApiError } from './utils/api-error.js'
const app = express()
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '16kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.get('/api/dashboard', (req, res) => { sessionUser(req.headers.authorization); res.json(dashboardData()) })
app.post('/api/snailpay/charges', (req, res) => {
  const result = charge(sessionUser(req.headers.authorization), req.body, req.get('Idempotency-Key') ?? '')
  res.status(result.httpStatus).json(result.body)
})
app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }))
// Un solo lugar traduce los errores a mensajes comprensibles para el frontend.
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) { res.status(error.status).json({ message: error.message }); return }
  if (error?.type === 'entity.parse.failed') { res.status(400).json({ message: 'JSON inválido' }); return }
  if (error?.type === 'entity.too.large') { res.status(413).json({ message: 'Solicitud demasiado grande' }); return }
  console.error('Error interno:', error.message)
  res.status(500).json({ message: 'Error interno del servidor' })
}
app.use(errorHandler)
export default app
