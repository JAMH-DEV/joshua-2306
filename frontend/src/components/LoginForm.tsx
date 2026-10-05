import { useState } from 'react'
import { Mail, Lock, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Input from './Input'
import Button from './Button'

import { login } from '../services/auth.service'

interface LoginFormProps {
  onRegister: () => void
}

function LoginForm({ onRegister }: LoginFormProps) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // React Router
  const navigate = useNavigate()

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    if (busy) return

    setError('')

    setBusy(true)
    try {

      await login({
        email,
        password
      })





      // Nos vamos al dashboard
      navigate('/dashboard')

    } catch (error) {

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Ocurrió un error al iniciar sesión')
      }

    } finally { setBusy(false) }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8"
    >

      <div className="flex flex-col gap-2">

        <h1 className="text-4xl font-bold text-white">
          Iniciar Sesión
        </h1>

        <p className="text-slate-400">
          Bienvenido de nuevo a Snail Casino
        </p>

      </div>

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@email.com"
        icon={<Mail size={28} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={28} />}
        rightIcon={<Eye size={28} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button disabled={busy}
        text="Iniciar sesión"
        type="submit"
      />

      <p className="text-slate-400">

        ¿No tienes una cuenta?{' '}

        <button
          type="button"
          onClick={onRegister}
          className="
            text-emerald-500
            cursor-pointer
            hover:text-emerald-400
          "
        >
          Regístrate
        </button>

      </p>

    </form>
  )
}

export default LoginForm

