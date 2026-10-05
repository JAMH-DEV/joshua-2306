import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import app from '../src/app.js'
import { users, sessions } from '../src/data/memory.store.js'
const server = app.listen(0)
let base: string
let token: string
let user: { id: string; email: string }
const credentials = { fullName: 'Usuario Ejemplo', email: 'Example@Test.com', password: 'clave12345' }
before(async () => {
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
})
after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())))
async function api(path: string, body?: unknown, authenticated = true, reference?: string) {
  const response = await fetch(`${base}${path}`, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}), ...(reference ? { 'Idempotency-Key': reference } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) })
  return { status: response.status, data: response.status === 204 ? null : await response.json() }
}
function payment(overrides: Record<string, unknown> = {}) {
  return { card_number: '1234123412341234', expiration_date: '12/26', cvv: '543', full_name: credentials.fullName,
    transaction_amount: 100.25, payer_id: user.id, payer_email: user.email, ...overrides }
}
test('registro valida, normaliza correo, inicia en cero y no expone contraseña', async () => {
  assert.equal((await api('/auth/register', { ...credentials, password: 'corta' })).status, 400)
  assert.equal((await api('/auth/register', { ...credentials, email: 123 })).status, 400)
  const result = await api('/auth/register', credentials)
  assert.equal(result.status, 201)
  user = result.data.user
  assert.equal(result.data.user.balance, 0)
  assert.equal(user.email, 'example@test.com')
  assert.equal(result.data.user.password, undefined)
  assert.notEqual(users[0].password, credentials.password)
  assert.equal((await api('/auth/register', credentials)).status, 409)
})
test('login y rutas protegidas', async () => {
  assert.equal((await api('/dashboard', undefined, false)).status, 401)
  assert.equal((await api('/auth/login', { ...credentials, password: 'equivocada' })).status, 401)
  const result = await api('/auth/login', credentials)
  token = result.data.token
  assert.equal(typeof token, 'string')
  assert.equal(result.data.user.id, user.id)
  assert.equal(result.data.user.password, undefined)
})
test('dashboard contiene seis caracoles y 50 carreras congruentes que permanecen en caché', async () => {
  const { data } = await api('/dashboard')
  assert.equal(data.snails.length, 6)
  assert.equal(data.races.length, 50)
  assert.equal(data.snails.reduce((sum: number, snail: { wins: number }) => sum + snail.wins, 0), 50)
  for (const snail of data.snails) assert.equal(snail.wins, data.races.filter((race: { id: string }) => race.id === snail.id).length)
  assert.equal(data.won + data.lost, 50)
  assert.deepEqual((await api('/dashboard')).data, data)
  assert.deepEqual(data.races.map((race: { raceNumber: number }) => race.raceNumber), Array.from({ length: 50 }, (_, index) => index + 1))
})
test('aprobación contiene contrato completo y reintentos no duplican el saldo', async () => {
  const first = await api('/snailpay/charges', payment(), true, 'approved')
  assert.equal(first.status, 200)
  assert.equal(first.data.status, 'approved')
  assert.equal(first.data.balance, 100.25)
  for (const field of ['id', 'status', 'status_detail', 'transaction_amount', 'date_created', 'authorization_code', 'reference', 'payer_id', 'payer_email', 'card_number', 'cvv']) assert.ok(field in first.data)
  assert.equal(first.data.card_number, '1234123412341234')
  assert.equal(first.data.cvv, '543')
  const retry = await api('/snailpay/charges', payment(), true, 'approved')
  assert.equal(retry.data.id, first.data.id)
  assert.equal(retry.data.balance, 100.25)
  assert.equal((await api('/snailpay/charges', payment({ transaction_amount: 200 }), true, 'approved')).status, 409)
})
test('rechazos y validaciones no cambian saldo', async () => {
  const rejected = await api('/snailpay/charges', payment({ card_number: '4000400040004000' }), true, 'rejected')
  assert.equal(rejected.status, 422)
  assert.equal(rejected.data.status, 'rejected')
  assert.equal(rejected.data.authorization_code, null)
  for (const [index, amount] of [0, -1, 1.001, '100', 100001].entries()) assert.equal((await api('/snailpay/charges', payment({ transaction_amount: amount }), true, `invalid-${index}`)).status, 422)
  assert.equal((await api('/snailpay/charges', payment({ payer_id: 'otro' }), true, 'foreign')).status, 403)
  assert.equal((await api('/auth/me')).data.user.balance, 100.25)
})
test('error interno por tarjeta o variable no aprueba recargas', async () => {
  const error = await api('/snailpay/charges', payment({ card_number: '5000500050005000' }), true, 'error')
  assert.equal(error.status, 503)
  assert.equal(error.data.status, 'error')
  assert.equal(error.data.balance, 100.25)
  process.env.SNAILPAY_SYSTEM_ERROR = 'true'
  try { assert.equal((await api('/snailpay/charges', payment(), true, 'system')).status, 503) }
  finally { delete process.env.SNAILPAY_SYSTEM_ERROR }
  assert.equal((await api('/auth/me')).data.user.balance, 100.25)
})
test('sumas en centavos y sesión válida tras consultar nuevamente', async () => {
  await api('/snailpay/charges', payment({ transaction_amount: 0.1 }), true, 'decimal-one')
  await api('/snailpay/charges', payment({ transaction_amount: 0.2 }), true, 'decimal-two')
  assert.equal((await api('/auth/me')).data.user.balance, 100.55)
})
test('logout invalida token y se puede iniciar sesión otra vez', async () => {
  assert.equal((await api('/auth/logout', {})).status, 204)
  assert.equal((await api('/auth/me')).status, 401)
  const result = await api('/auth/login', credentials)
  token = result.data.token
  assert.equal(result.data.user.balance, 100.55)
})
test('sesiones expiradas y JSON inválido tienen respuestas controladas', async () => {
  sessions.find(session => session.token === token)!.expiresAt = 0
  assert.equal((await api('/auth/me')).status, 401)
  const response = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{malformed' })
  assert.equal(response.status, 400)
})

