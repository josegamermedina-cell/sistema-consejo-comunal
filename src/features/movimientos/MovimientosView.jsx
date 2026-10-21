import { useState } from 'react';
import { cambiarEstadoHabitante } from '../../services/censoService';
import { UserMinus, UserCheck, History, AlertCircle } from 'lucide-react';

const MAX_MOTIVO = 100;

export default function MovimientosView({
  habitantes,
  movimientos,
  recargarDatos,
}) {
  const [habitanteSeleccionado, setHabitanteSeleccionado] = useState('');
  const [accion, setAccion] = useState('salio');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleRegistrarMovimiento = async (e) => {
    e.preventDefault();
    setError('');
    const motivoLimpio = motivo.trim();
    if (!habitanteSeleccionado) {
      setError('Debes seleccionar un habitante de la lista.');
      return;
    }
    if (motivoLimpio.length < 4 || motivoLimpio.length > MAX_MOTIVO) {
      setError(`El motivo debe tener entre 4 y ${MAX_MOTIVO} caracteres.`);
      return;
    }

    setProcesando(true);
    try {
      await cambiarEstadoHabitante(
        habitanteSeleccionado,
        accion,
        motivoLimpio.slice(0, MAX_MOTIVO)
      );
      setHabitanteSeleccionado('');
      setMotivo('');
      recargarDatos();
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#E8EEF7] p-6 rounded-3xl border-2 border-indigo-200 shadow-sm">
        <h1 className="text-2xl font-black text-indigo-950">
          Control de Entradas y Salidas de la Comunidad
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-0.5">
          Actualiza si algún habitante se mudó fuera de la comunidad o regresó a su vivienda.
        </p>
      </div>

      <div className="bg-[#E8EEF7] border-2 border-indigo-300 rounded-3xl p-6 shadow-md">
        <h2 className="text-base font-black text-indigo-950 mb-4">
          Registrar Cambio de Residencia / Estado
        </h2>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-100 border-2 border-rose-400 text-rose-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form
          onSubmit={handleRegistrarMovimiento}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
              Seleccionar Habitante *
            </label>
            <select
              required
              value={habitanteSeleccionado}
              onChange={(e) => setHabitanteSeleccionado(e.target.value)}
              className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              <option value="">Buscar habitante...</option>
              {habitantes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombres} {h.apellidos} ({h.cedula || 'S/C'}) —{' '}
                  {h.estado.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
              Tipo de Movimiento *
            </label>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              <option value="salio">Salida de la Comunidad (Mudanza)</option>
              <option value="activo">Reingreso a la Comunidad (Activo)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
              <span>Motivo / Observación *</span>
              <span>
                {motivo.length}/{MAX_MOTIVO}
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={MAX_MOTIVO}
              placeholder="Ej: Se mudó de sector / Regresó al hogar"
              value={motivo}
              onChange={(e) =>
                setMotivo(
                  e.target.value.replace(/[<>{}[\]\\]/g, '').slice(0, MAX_MOTIVO)
                )
              }
              className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-xl px-3 py-2.5 text-sm font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition cursor-pointer"
          >
            {procesando ? 'Actualizando...' : 'Actualizar Estado'}
          </button>
        </form>
      </div>

      <div className="bg-[#E8EEF7] border-2 border-indigo-300 rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-indigo-800" />
          <h2 className="text-base font-black text-indigo-950">
            Historial de Entradas y Salidas Registradas
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border-2 border-indigo-300">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-900 text-white text-xs uppercase">
                <th className="py-3.5 px-4 font-extrabold">Fecha</th>
                <th className="py-3.5 px-4 font-extrabold">Habitante</th>
                <th className="py-3.5 px-4 font-extrabold">Movimiento</th>
                <th className="py-3.5 px-4 font-extrabold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-indigo-200">
              {movimientos.length === 0 ? (
                <tr className="bg-[#DCE4F2]">
                  <td
                    colSpan="4"
                    className="text-center py-8 text-indigo-950 font-bold"
                  >
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                movimientos.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={idx % 2 === 0 ? 'bg-[#DCE4F2]' : 'bg-[#CFD9EC]'}
                  >
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {m.fecha_movimiento}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {m.habitantes?.nombres} {m.habitantes?.apellidos} (
                      {m.habitantes?.cedula || 'S/C'})
                    </td>
                    <td className="py-3 px-4">
                      {m.tipo_movimiento === 'salida' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-600 text-white">
                          <UserMinus size={12} /> Salida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold bg-emerald-700 text-white">
                          <UserCheck size={12} /> {m.tipo_movimiento.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{m.motivo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}