import { Snail, Trophy } from 'lucide-react'

interface RaceCardProps {
  raceNumber: number
  snailName: string
  snailColor?: string
}

function RaceCard({
  raceNumber,
  snailName,
  snailColor = '#facc15'
}: RaceCardProps) {
  return (
    <div
      className="
        w-full
        rounded-xl
        border border-white/10
        bg-zinc-900/90
        py-1
        px-4
      "
    >
      {/* Número de carrera */}
      <span className="text-xs font-semibold text-slate-400">
        Carrera #{raceNumber}
      </span>

      {/* Ganador */}
      <div className="mt-3 flex items-center gap-3">

        {/* Caracol */}
        <div
          className={`
            w-12 h-12
            rounded-lg
            flex items-center
            justify-center
            bg-white/5

          `}
        >
          {/* El hexadecimal del API funciona sin clases dinámicas de Tailwind. */}
          <Snail size={32} strokeWidth={2} style={{ color: snailColor }} />
        </div>

        {/* Información */}
        <div className="flex flex-col gap-1">

          <span className="text-sm font-semibold text-white">
            {snailName}
          </span>

          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy size={14} />

            <span className="text-xs font-semibold">
              Ganador
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default RaceCard
