import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
  type Plugin
} from 'chart.js'

import { Doughnut } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

// Plugin para escribir el porcentaje en el centro
const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',

  afterDraw(chart) {
    const { ctx } = chart

    const dataset = chart.data.datasets[0]

    if (!dataset) return

    const values = dataset.data as number[]

    const total = values.reduce((sum, value) => sum + value, 0)

    const won = values[0] ?? 0

    const percentage =
      total > 0
        ? total ? Math.round((won / total) * 100) : 0
        : 0

    const meta = chart.getDatasetMeta(0)
    const firstArc = meta.data[0]

    if (!firstArc) return

    const { x, y } = firstArc

    ctx.save()

    // Porcentaje
    ctx.font = 'bold 26px sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText(
      `${percentage}%`,
      x,
      y - 7
    )

    // Texto Ganadas
    ctx.font = '13px sans-serif'
    ctx.fillStyle = '#cbd5e1'

    ctx.fillText(
      'Ganadas',
      x,
      y + 18
    )

    ctx.restore()
  }
}

// Este plugin sólo debe dibujar dentro del donut, no en la gráfica de barras.

function BetsDonutChart({ won, lost }: { won: number; lost: number }) {

  const total = won + lost

  const data = {
    labels: [
      'Ganadas',
      'Perdidas'
    ],

    datasets: [
      {
        data: [won, lost],

        backgroundColor: [
          '#10f59a',
          '#ff4d57'
        ],

        borderWidth: 0,

        hoverOffset: 4
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: '68%',

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            return `${context.label}: ${context.raw}`
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-full flex items-center">

      {/* Gráfica */}
      <div className="w-1/2 h-full min-h-52">
        <Doughnut plugins={[centerTextPlugin]}
          data={data}
          options={options}
        />
      </div>


      {/* Información */}
      <div className="w-1/2 flex flex-col gap-5">

        {/* Ganadas */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-3 h-3 rounded-full bg-emerald-400" />

            <span className="text-sm text-slate-300">
              Ganadas
            </span>

          </div>

          <span className="text-sm font-semibold text-white">
            {total ? Math.round((won / total) * 100) : 0}% ({won})
          </span>

        </div>


        {/* Perdidas */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-3 h-3 rounded-full bg-red-500" />

            <span className="text-sm text-slate-300">
              Perdidas
            </span>

          </div>

          <span className="text-sm font-semibold text-white">
            {total ? Math.round((lost / total) * 100) : 0}% ({lost})
          </span>

        </div>


        {/* Total */}
        <div className="pt-3 border-t border-white/10">

          <span className="text-sm text-slate-400">
            Total de apuestas:{' '}
          </span>

          <span className="text-sm font-bold text-white">
            {total}
          </span>

        </div>

      </div>

    </div>
  )
}

export default BetsDonutChart

