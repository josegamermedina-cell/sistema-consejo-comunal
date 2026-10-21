export default function LoaderComunal({ pantallaCompleta = true, texto = 'Cargando...' }) {
  if (!pantallaCompleta) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-slate-900/90 text-slate-100 px-4 py-2.5 rounded-lg shadow-lg border border-slate-700/60 flex items-center gap-3 backdrop-blur-sm">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-[11px] font-bold tracking-wide text-slate-200">{texto}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[1280px] bg-[#0F172A] flex flex-col items-center justify-center p-6 text-slate-100 font-sans select-none">
      <div className="w-full max-w-xs flex flex-col items-center space-y-4">
        
        {/* Logo oficial y nombre pequeño */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className="w-12 h-12 bg-white/95 p-2 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center">
            <img src="/registro.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-indigo-400">
            Comuna Activa
          </span>
        </div>

        {/* Barra de carga sencilla y fluida */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-indigo-500 rounded-full animate-[pulse_1.2s_cubic-bezier(0.4,0,0.6,1)_infinite] w-2/5" />
        </div>

      </div>
    </div>
  );
}