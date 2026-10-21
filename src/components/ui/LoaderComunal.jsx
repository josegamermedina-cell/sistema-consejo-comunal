export default function LoaderComunal({ pantallaCompleta = true, texto = 'Sincronizando datos...' }) {
  if (!pantallaCompleta) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-slate-100 px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase text-slate-300">{texto}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[1280px] bg-[#0F172A] flex flex-col items-center justify-center p-6 text-slate-100 font-sans select-none">
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6">
        
        {/* Identidad corporativa sutil */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-600/30">
            CC
          </div>
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-indigo-400 mt-2">
            Comuna App
          </span>
        </div>

        {/* Mensaje de estado profesional */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide">
            Estableciendo sesión segura
          </h2>
          <p className="text-xs text-slate-400 font-medium">{texto}</p>
        </div>

        {/* Línea de carga técnica minimalista */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] w-1/2" />
        </div>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Consejo Comunal • Módulo Principal
        </p>
      </div>
    </div>
  );
}