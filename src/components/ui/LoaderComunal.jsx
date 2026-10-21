import { Building2 } from 'lucide-react';

export default function LoaderComunal({ pantallaCompleta = true, texto = 'Cargando Sistema Comunal...' }) {
  if (!pantallaCompleta) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-indigo-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 flex items-center gap-3.5 backdrop-blur-md animate-bounce">
        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <span className="text-sm font-bold tracking-wide">{texto}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="relative flex items-center justify-center mb-8">
        {/* Anillo exterior giratorio */}
        <div className="w-28 h-28 rounded-full border-4 border-indigo-400/20 border-t-white animate-spin" />
        {/* Anillo interior invertido */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-violet-400/20 border-b-indigo-300 animate-spin" />
        {/* Ícono central */}
        <div className="absolute w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner">
          <Building2 size={26} className="text-white animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">
        Comuna App
      </h2>
      <p className="text-sm text-indigo-200 font-medium mb-6">{texto}</p>

      {/* Barra de progreso animada */}
      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
        <div className="h-full bg-gradient-to-r from-indigo-400 via-white to-violet-400 rounded-full w-2/3 animate-pulse" />
      </div>
    </div>
  );
}