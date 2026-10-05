import { useState } from 'react'
import { User, Mail, Lock, Eye } from 'lucide-react'

import Input from './Input'
import Button from './Button'

import { register } from '../services/auth.service'

interface RegisterFormProps {
  onLogin: () => void
}

function RegisterForm({ onLogin }: RegisterFormProps) {

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    if (busy) return

    setError('')
    setSuccess('')

    // Validación frontend
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setBusy(true)
    try {

      await register({
        fullName,
        email,
        password
      })



      setSuccess('Cuenta creada correctamente')

      // Después del registro mandamos al login
      setTimeout(() => {
        onLogin()
      }, 800)

    } catch (error) {

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Ocurrió un error al registrarse')
      }

    } finally { setBusy(false) }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >

      {/* Encabezado */}
      <div className="flex flex-col gap-2">

        <h1 className="text-4xl font-bold text-white">
          Crear Cuenta
        </h1>

        <p className="text-slate-400">
          Regístrate y comienza en Snail Casino
        </p>

      </div>


      {/* Nombre */}
      <Input
        height="h-13"
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre"
        icon={<User size={28} />}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />


      {/* Correo */}
      <Input
        height="h-13"
        label="Correo electrónico"
        type="email"
        placeholder="tu@email.com"
        icon={<Mail size={28} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />


      {/* Contraseña */}
      <Input
        height="h-13"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={28} />}
        rightIcon={<Eye size={28} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />


      {/* Confirmar contraseña */}
      <Input
        height="h-13"
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={28} />}
        rightIcon={<Eye size={28} />}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />


      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}


      {/* Mensaje correcto */}
      {success && (
        <p className="text-sm text-emerald-400">
          {success}
        </p>
      )}


      <Button disabled={busy}
        text="Registrarse"
        type="submit"
      />


      <p className="text-slate-400">

        ¿Ya tienes una cuenta?{' '}

        <button
          type="button"
          onClick={onLogin}
          className="
            text-emerald-500
            cursor-pointer
            hover:text-emerald-400
          "
        >
          Inicia sesión
        </button>

      </p>

    </form>
  )
}

export default RegisterForm

