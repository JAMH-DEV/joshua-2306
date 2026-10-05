interface StatCardProps {
  icon: React.ReactNode
  title: string

  subtitle?: string
  value?: string | number
  bottomText?: string

  iconSize?: string
  titleSize?: string
  subtitleSize?: string
  valueSize?: string
  bottomTextSize?: string

  padding?: string
  bottomTextColor?: string
  height?: string
}

function StatCard({
  icon,
  title,
  subtitle,
  value,
  bottomText,

  iconSize = 'w-10 h-10',
  titleSize = 'text-xs',
  subtitleSize = 'text-sm',
  valueSize = 'text-lg',
  bottomTextSize = 'text-xs',

  padding = 'px-3 py-2',
  bottomTextColor = 'text-emerald-400',
  height = 'h-16'
}: StatCardProps) {

  return (
    <div
      className={`
        flex-1
        ${height}
        ${padding}
        rounded-xl
        border border-white/10
        bg-zinc-900/90
        min-w-0
        flex
        items-center
        gap-3
      `}
    >

      {/* Icono */}
      <div
        className={`
          ${iconSize}
          flex
          items-center
          justify-center
          rounded-lg
          bg-emerald-500/15
          text-emerald-400
          shrink-0
        `}
      >
        {icon}
      </div>

      {/* Información */}
      <div className="flex flex-col justify-center min-w-0">

        <h3 className={`${titleSize} text-slate-400`}>
          {title}
        </h3>

        {subtitle && (
          <span className={`${subtitleSize} font-semibold text-white`}>
            {subtitle}
          </span>
        )}

        {value !== undefined && (
          <span className={`${valueSize} font-bold text-white`}>
            {value}
          </span>
        )}

        {bottomText && (
          <span className={`${bottomTextSize} ${bottomTextColor}`}>
            {bottomText}
          </span>
        )}

      </div>

    </div>
  )
}

export default StatCard