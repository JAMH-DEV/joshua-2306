import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  children: ReactNode
  className?: string
  padding?: string
}

function DashboardCard({
  title,
  children,
  className = '',
  padding = 'p-4'
}: DashboardCardProps) {

  return (
    <div
      className={`
        w-full
        h-full
        bg-zinc-800/80
        border border-white/20
        rounded-3xl
        
        ${padding}
        ${className}
      `}
    >

      {/* Título */}
      <h2 className="text-lg font-semibold text-white mb-4">
        {title}
      </h2>

      {/* Contenido */}
      <div className="w-full">
        {children}
      </div>

    </div>
  )
}

export default DashboardCard