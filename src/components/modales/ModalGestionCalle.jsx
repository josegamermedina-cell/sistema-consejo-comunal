import { Trash2, X } from 'lucide-react';

// Función que permite únicamente letras y espacios, con tope de 28 caracteres
const limpiarSoloLetras = (valor, max = 28) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, max);

export function ModalNuevaCalle({
  abierto,
  onCerrar,
  onSubmit,
  nombre,
  setNombre,
  sector,
  setSector,
  procesando,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">Agregar Nueva Calle</h3>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase text-slate-700">
                Nombre de la Calle (Solo letras)
              </label>
              <span className="text-[11px] font-bold text-indigo-600">
                {nombre.length}/28
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={28}
              placeholder="Ej: Calle Bolivar"
              value={nombre}
              onChange={(e) => setNombre(limpiarSoloLetras(e.target.value, 28))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase text-slate-700">
                Sector o Referencia (Solo letras)
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                {sector.length}/28
              </span>
            </div>
            <input
              type="text"
              maxLength={28}
              placeholder="Ej: Sector Centro"
              value={sector}
              onChange={(e) => setSector(limpiarSoloLetras(e.target.value, 28))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {procesando ? 'Guardando...' : 'Guardar Calle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalEliminarCalle({ calle, onCerrar, onConfirmar, procesando }) {
  if (!calle) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
            <Trash2 size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              ¿Eliminar {calle.nombre}?
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Esta acción quitará la calle y las casas registradas en ella.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={onConfirmar}
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
          >
            {procesando ? 'Eliminando...' : 'Sí, Eliminar Calle'}
          </button>
        </div>
      </div>
    </div>
  );
}