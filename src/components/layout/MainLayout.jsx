import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PieChart,
  MapPin,
  HeartHandshake,
  ArrowLeftRight,
  LogOut,
  Building2,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';

export default function MainLayout({
  tabActiva,
  setTabActiva,
  busquedaGlobal,
  setBusquedaGlobal,
  children,
}) {
  const { cerrarSesion } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'demografia', label: 'Distribución Demográfica', icon: PieChart },
    { id: 'calles', label: 'Calles y Familias', icon: MapPin },
    { id: 'salud_beneficios', label: 'Salud y Beneficios', icon: HeartHandshake },
    { id: 'movimientos', label: 'Entradas y Salidas', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen min-w-[1280px] bg-[#BEC8D8] text-slate-800 flex flex-row p-5 gap-5 font-sans">
      {/* MENÚ LATERAL FLOTANTE REDONDEADO */}
      <aside className="w-76 bg-gradient-to-b from-indigo-800 via-indigo-900 to-violet-950 text-white rounded-[32px] flex flex-col justify-between p-6 shadow-2xl shrink-0 border border-indigo-400/20">
        <div>
          <div className="flex items-center gap-3.5 px-3 pt-2 pb-8">
            <div className="p-3 bg-indigo-500/25 backdrop-blur-md rounded-2xl text-white border border-indigo-300/30 shadow-inner">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight text-white">
                Comuna App
              </h2>
              <p className="text-xs text-indigo-200 font-medium">Gestión Comunitaria</p>
            </div>
          </div>

          <nav className="space-y-2.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const activo = tabActiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTabActiva(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[15px] transition-all cursor-pointer text-left ${
                    activo
                      ? 'bg-[#E0E7FF] text-indigo-950 font-extrabold shadow-lg shadow-indigo-950/40'
                      : 'text-indigo-100 hover:bg-white/10 font-medium'
                  }`}
                >
                  <Icon
                    size={21}
                    className={`shrink-0 ${activo ? 'text-indigo-800' : 'text-indigo-200'}`}
                  />
                  <span className="leading-snug">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/15">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-semibold text-indigo-100 hover:bg-rose-500/25 hover:text-white transition cursor-pointer"
          >
            <LogOut size={22} />
            <span>Salir del Sistema</span>
          </button>
        </div>
      </aside>

      {/* CONTENEDOR DEL SISTEMA */}
      <div className="flex-1 bg-[#D5DFEE] border-2 border-indigo-200/80 rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto">
        <header className="flex flex-row items-center justify-between gap-4 pb-2 border-b border-indigo-200/70">
          <div className="flex items-center gap-3 w-full max-w-md bg-[#E8EEF7] rounded-2xl px-4 py-3 shadow-inner border-2 border-indigo-200">
            <Search size={18} className="text-indigo-700 shrink-0" />
            <input
              type="text"
              maxLength={50}
              value={busquedaGlobal}
              onChange={(e) => setBusquedaGlobal(e.target.value.slice(0, 50))}
              placeholder="Buscar por nombre, cédula, calle o beneficio..."
              className="bg-transparent border-none text-sm font-semibold text-slate-800 placeholder-slate-500 focus:outline-none w-full"
            />
            {busquedaGlobal && (
              <span className="text-[10px] font-bold text-indigo-600">
                {busquedaGlobal.length}/50
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-full bg-[#E8EEF7] text-indigo-800 hover:bg-indigo-200/70 shadow-sm border-2 border-indigo-200 cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 bg-[#E8EEF7] pl-2 pr-4 py-1.5 rounded-full shadow-sm border-2 border-indigo-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-700 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
                CC
              </div>
              <div className="text-left">
                <p className="text-sm font-extrabold text-slate-900 leading-none">
                  Admin Comunal
                </p>
                <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                  Vocería Principal
                </p>
              </div>
              <ChevronDown size={15} className="text-indigo-700 ml-1" />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}