import { useState } from 'react'
import { LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'

import logo from '../assets/images/logo.png'
import logoIcon from '../assets/images/logo-icon.png'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      className={`
        h-screen
        bg-slate-950
        border-r border-white/10
        flex flex-col
        transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >

      {/* Logo */}
      <div className="h-24 flex items-center justify-center">
        <img
          src={isOpen ? logo : logoIcon}
          alt="Snail Casino"
          className={isOpen ? 'w-44' : 'w-12'}
        />
      </div>

      {/* Menú */}
      <nav className="flex-1 px-3 py-6">

        <button
          className="
            w-full
            flex items-center
            gap-3
            rounded-xl
            bg-emerald-500/10
            px-4 py-3
            text-emerald-400
            cursor-pointer
            hover:bg-emerald-500/20
            transition-colors
          "
        >
          <LayoutDashboard size={24} />

          {isOpen && (
            <span className="font-medium">
              Dashboard
            </span>
          )}
        </button>

      </nav>

      {/* Abrir / cerrar */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-full
            flex
            items-center
            justify-center
            rounded-xl
            border border-white/10
            py-3
            text-slate-400
            hover:bg-white/5
            hover:text-white
            cursor-pointer
            transition-colors
          "
        >
          {isOpen ? (
            <ChevronLeft size={22} />
          ) : (
            <ChevronRight size={22} />
          )}
        </button>
      </div>

    </aside>
  )
}

export default Sidebar