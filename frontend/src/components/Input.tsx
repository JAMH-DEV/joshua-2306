import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps {
  step?: string; min?: string; max?: string
  label: string
  type: string
  placeholder: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  height?: string

  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function Input({
  label,
  type,
  placeholder,
  icon,
  rightIcon,
  height = 'h-15',
  value,
  onChange, step, min, max
}: InputProps) {

  const id = useId()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className={`
        flex items-center
        ${height}
        w-full
        rounded-xl
        border border-slate-700
        bg-slate-900/80
        px-2 py-3
        focus-within:border-emerald-400
        transition-colors
      `}
    >

      {/* Icono izquierdo */}
      {icon && (
        <div className="mr-4 text-slate-300">
          {icon}
        </div>
      )}

      {/* Label + Input */}
      <div className="flex flex-1 flex-col">

        <label htmlFor={id} className="text-sm text-slate-300">
          {label}
        </label>

        <input required id={id} step={step} min={min} max={max}
          type={
            type === 'password' && showPassword
              ? 'text'
              : type
          }
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="
            bg-transparent
            text-white
            outline-none
            placeholder:text-slate-400
          "
        />

      </div>

      {/* Mostrar / ocultar contraseña */}
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="
            ml-3
            cursor-pointer
            text-slate-300
            hover:text-white
          "
        >
          {showPassword ? (
            <EyeOff size={28} />
          ) : (
            <Eye size={28} />
          )}
        </button>
      )}

      {/* Icono derecho para inputs que NO son password */}
      {type !== 'password' && rightIcon && (
        <div className="ml-3 text-slate-300">
          {rightIcon}
        </div>
      )}

    </div>
  )
}

export default Input

