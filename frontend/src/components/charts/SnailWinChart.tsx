import type { Snail as SnailData } from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions
} from 'chart.js'

import { Bar } from 'react-chartjs-2'
import { Snail } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
)

function SnailWinsChart({ snails }: { snails: SnailData[] }) {

  const totalRaces = snails.reduce((total, snail) => total + snail.wins, 0)
  const mostWins = Math.max(0, ...snails.map(snail => snail.wins))
  const leaders = snails.filter(snail => snail.wins === mostWins && mostWins > 0)
  // Mostramos a todos los líderes si hay empate.

  const data = {
    labels: snails.map(() => ''),

    datasets: [
      {
        data: snails.map((snail) => snail.wins),

        backgroundColor: snails.map(
          (snail) => snail.chartColor
        ),

        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.55,
        categoryPercentage: 0.8
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {


      legend: {
        display: false
      },

      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0]?.dataIndex

            return snails[index]?.name ?? ''
          },

          label: (context) => {
            return `Victorias: ${context.raw}`
          }
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },

        ticks: {
          display: false
        },

        border: {
          display: false
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          stepSize: 1,
          color: '#94a3b8'
        },

        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },

        border: {
          display: false
        }
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col">

      <p className="pb-2 text-sm text-slate-300" role="status">
        {leaders.length > 0 ? <>
          <span style={{ color: leaders[0].chartColor }} className="font-semibold">{leaders.map(snail => snail.name).join(' / ')}</span>
          {' · '}{mostWins} victorias de {totalRaces} carreras
          {leaders.length > 1 && ' · Empate'}
        </> : 'Sin carreras registradas'}
      </p>
      {/* GRÁFICA */}
      <div className="flex-1 min-h-0">
        <Bar
          data={data}
          options={options}
        />
      </div>

      {/* CARACOLES */}
      <div className="grid grid-cols-6 pt-3">

        {snails.map((snail) => (
          <div
            key={snail.name}
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
            "
          >
            <Snail
              size={28}
              strokeWidth={2}
              // El color del API se aplica directamente; Tailwind no analiza el backend.
              style={{ color: snail.chartColor }}
            />

            <span
              className="
                text-xs
                font-medium
                text-slate-300
                text-center
              "
            >
              {snail.name}
            </span>
          </div>
        ))}

      </div>

    </div>
  )
}

export default SnailWinsChart



