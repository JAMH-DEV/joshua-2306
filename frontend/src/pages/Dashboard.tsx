import { Wallet, Plus, Database, Trophy, TrendingDown, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, request, saveProfile } from '../services/api'
import type { Profile, DashboardData } from '../services/api'
import { logout } from '../services/auth.service'
//Components
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import DashboardCard from '../components/DashboardCard'
import BetsDonutChart from '../components/charts/BetsDonutChart'
import SnailWinsChart from '../components/charts/SnailWinChart'
import RaceCard from '../components/RaceCard'
import SnailPayDrawer from '../components/SnailPayDrawer'
//Images
import imgDash from '../assets/images/imgDash.png'

function Dashboard() {
  const [isSnailPayOpen, setIsSnailPayOpen] = useState(false)
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    // Validamos el token con Express; LocalStorage no decide si la sesión es válida.
    Promise.all([request<{ user: Profile }>('/auth/me'), request<DashboardData>('/dashboard')])
      .then(([account, dashboard]) => {
        if (!active) return
        saveProfile(account.user); setProfile(account.user); setStats(dashboard); setError('')
      }).catch(error => {
        if (!active) return
        if (error instanceof ApiError && error.status === 401) navigate('/login', { replace: true })
        else setError(error instanceof Error ? error.message : 'Error al cargar el dashboard')
      })
    return () => { active = false }
  }, [navigate, retry])
  async function handleLogout() {
    try { await logout() } catch { /* La sesión local se elimina incluso sin conexión. */ }
    navigate('/login', { replace: true })
  }
  function updateBalance(balance: number) {
    if (!profile) return
    const updated = { ...profile, balance }
    setProfile(updated); saveProfile(updated)
  }
  if (!profile || !stats) return <main className="min-h-screen bg-zinc-950 text-white p-8">
    <p role="status">{error || 'Cargando dashboard...'}</p>
    {error && <button className="p-3 text-emerald-400" onClick={() => setRetry(value => value + 1)}>Reintentar</button>}
    <button className="p-3" onClick={handleLogout}>Cerrar sesión</button>
  </main>
  return (
    <main className="h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <section className="flex-1 h-screen flex flex-col">

        {/* Parte superior: */}

     <div
          className="
            h-1/3
            bg-cover bg-center
            relative
            overflow-hidden
          "
          style={{ backgroundImage: `url(${imgDash})` }}
        >

          <div className="absolute inset-0 bg-black/30" />


          <div className="relative z-10 h-full flex flex-col">

            <div className="h-1/2 px-6 pt-5 flex justify-between items-start">

            {/* Saludo */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                ¡Hola, {profile.fullName}!
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-200">
                ¡Victorias... a la velocidad de un caracol!
              </p>
            </div>

            {/* Cerrar sesión */}
            <button onClick={handleLogout}
              type="button"
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-black/50
                border
                border-white/10
                text-slate-200
                hover:bg-red-500/20
                hover:text-red-400
                hover:border-red-500/30
                cursor-pointer
                transition-colors
              "
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>

          </div>

            <div className="h-1/2 px-6 pb-5 mt-8 flex items-center gap-4">

              {/* Saldo */}
              <div
                className="
                  flex-[1.5]
                  h-20
                  bg-black/60
                  border border-white/10
                  rounded-xl
                  px-5
                  flex
                  items-center
                  justify-between
                "
              >
                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-14 h-14
                      rounded-xl
                      bg-emerald-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Wallet
                      size={22}
                      className="text-emerald-950"
                    />
                  </div>

                  <div className="flex flex-col">

                    <span className="text-xs text-slate-400">
                      Saldo disponible
                    </span>

                    <span className=" font-bold text-white">
                      {profile.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </span>

                  </div>
                </div>

                <button
                  type="button"
                    onClick={() => setIsSnailPayOpen(true)}
                    className="
                      flex items-center gap-2
                      bg-emerald-400
                      hover:bg-emerald-300
                      text-emerald-950
                      font-semibold
                      px-5 py-3
                      rounded-xl
                      cursor-pointer
                      transition-colors
                    "
                  >
                    <Plus size={18} />
                    Recargar
                </button> 

              </div>


              {/* Estadísticas */}

              <StatCard
                icon={<Database size={22} />}
                title="Total de apuestas"
                value={stats.won + stats.lost}
                height="h-20"
              />

              <StatCard
                icon={<Trophy size={22} />}
                title="Ganadas"
                value={stats.won}
                height="h-20"
              />

              <StatCard
                icon={<TrendingDown size={22} />}
                title="Perdidas"
                value={stats.lost}
                height="h-20"
              />

            </div>

          </div>
        </div>
         {/* Parte superior: - end */}
        {/* Parte inferior: 2/3 */}
        <div className="h-2/3">
        {/* Parte superior*/}
          <div className="w-full h-4/6 flex justify-center gap-4">
          <div className="h-full w-3/5 p-2 ">

           <DashboardCard title="Apuestas ganadas / perdidas">
              <BetsDonutChart won={stats.won} lost={stats.lost} />
          </DashboardCard>

          </div>
          <div className="h-full w-2/5 p-2">

          <DashboardCard title="Victorias por caracol">
            <SnailWinsChart snails={stats.snails} />
          </DashboardCard>

          </div>
          </div>
          {/* Parte superior: - end */}
          <div className="h-2/6 w-full  p-1 ">
          <DashboardCard title="Ultimas 6 victorias (Resumen)" >
            <div className="grid grid-cols-6 gap-2">
              {stats.races.slice(-6).reverse().map(race => <RaceCard key={race.raceNumber} raceNumber={race.raceNumber} snailName={race.name} snailColor={race.chartColor} />)}
            </div>
          </DashboardCard>
          </div>
        </div>

      </section>
      <SnailPayDrawer
        profile={profile} onBalanceChange={updateBalance} onSessionExpired={() => navigate('/login', { replace: true })}
        isOpen={isSnailPayOpen}
        setIsOpen={setIsSnailPayOpen}
      />
      
    </main>
  )
}

export default Dashboard


