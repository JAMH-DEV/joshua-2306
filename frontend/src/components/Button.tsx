interface ButtonProps {
  disabled?: boolean
  text: string
  type?: 'button' | 'submit' | 'reset'
}

function Button({
  text,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type} disabled={disabled}
      className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white cursor-pointer"
    >
      {text}
    </button>
  )
}

export default Button
