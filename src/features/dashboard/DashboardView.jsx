import { useState } from 'react';
import {
  calcularEdad,
  obtenerResumenEstadistico,
} from '../../utils/calculosDemograficos';
import { eliminarHabitante } from '../../services/censoService';
import {
  Home,
  Users,
  Gift,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Trash2,
  FolderKanban,
} from 'lucide-react';

export default function DashboardView({
  habitantes,
  familias,
  calles = [],
  busquedaGlobal = '',
  irACalles,
  recargarDatos,
}) {
  const [filtroGrupo, setFiltroGrupo] = useState('todos');

  const resumen = obtenerResumenEstadistico(habitantes, familias);
  const habitantesActivos = habitantes.filter((h) => h.estado === 'activo');

  const habitantesFiltrados = habitantesActivos.filter((p) => {
    const texto =
      `${p.nombres} ${p.apellidos} ${p.cedula || ''} ${p.detalle_patologia || ''} ${p.detalle_beneficio || ''} ${p.familias?.calles?.nombre || ''}`
        .toLowerCase();

    if (busquedaGlobal && !texto.includes(busquedaGlobal.toLowerCase())) {
      return false;
    }

    if (filtroGrupo === 'beneficios') {
      return p.recibe_beneficio;
    }
    return true;
  });

  // SOLO 3 TARJETAS SUPERIORES (Las demás están en Distribución Demográfica)
  const tarjetasPrincipales = [
    {
      id: 'todos',
      valor: resumen.totalFamilias,
      titulo: 'Total Familias',
      detalle: 'Viviendas censadas en la comunidad',
      icono: Home,
      colorIcono: 'bg-indigo-700 shadow-indigo-700/30',
    },
    {
      id: 'todos',
      valor: resumen.totalHabitantes,
      titulo: 'Total Habitantes',
      detalle: 'Personas activas registradas',
      icono: Users,
      colorIcono: 'bg-violet-700 shadow-violet-700/30',
    },
    {
      id: 'beneficios',
      valor: resumen.conBeneficios,
      titulo: 'Reciben Beneficios',
      detalle: 'CLAP • Bonos de la Patria • Gas Comunal',
      icono: Gift,
      colorIcono: 'bg-emerald-600 shadow-emerald-600/30',
    },
  ];

  const handleEliminarDesdeDashboard = async (persona) => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar del censo a ${persona.nombres} ${persona.apellidos}?`
      )
    ) {
      await eliminarHabitante(persona.id);
      if (recargarDatos) recargarDatos();
    }
  };

  return (
    <div className="space-y-6">
      {/* FILA 1: SOLO 3 CUADROS DESTACADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tarjetasPrincipales.map((card, index) => {
          const Icon = card.icono;
          const activa = filtroGrupo === card.id && card.id !== 'todos';
          return (
            <div
              key={index}
              onClick={() => setFiltroGrupo(card.id)}
              className={`bg-[#E8EEF7] rounded-3xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition cursor-pointer border-2 ${
                activa
                  ? 'border-indigo-700 ring-4 ring-indigo-500/20'
                  : 'border-indigo-200/90'
              }`}
            >
              <div>
                <div className="text-4xl font-black text-slate-900">
                  {card.valor}
                </div>
                <p className="text-base font-extrabold text-indigo-950 mt-1">
                  {card.titulo}
                </p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  {card.detalle}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl ${card.colorIcono} text-white flex items-center justify-center shadow-lg shrink-0`}
              >
                <Icon size={30} />
              </div>
            </div>
          );
        })}
      </div>

      {/* FILA 2: Jefes de Casa + Tarjeta Consejo Comunal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#E8EEF7] rounded-3xl p-6 shadow-md border-2 border-indigo-200/90">
          <div className="flex items-center justify-between mb-5 border-b border-indigo-200 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-indigo-950">
                Jefes de Casa Censados Recientemente
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Núcleos familiares activos por calle
              </p>
            </div>
            {irACalles && (
              <button
                onClick={irACalles}
                className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Ir al CRUD de Familias</span>
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {familias.filter((f) => f.activo).length === 0 ? (
              <div className="col-span-2 bg-[#DCE4F2] border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-indigo-900">
                  Aún no hay familias registradas.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Usa el botón "Ir al CRUD de Familias" para registrar el primer Jefe de Casa.
                </p>
              </div>
            ) : (
              familias
                .filter((f) => f.activo)
                .slice(0, 6)
                .map((fam) => {
                  const integrantesActivos = (fam.habitantes || []).filter(
                    (h) => h.estado === 'activo'
                  );
                  const jefe =
                    integrantesActivos.find((h) => h.es_jefe_familia) ||
                    integrantesActivos[0];
                  const iniciales = jefe
                    ? `${jefe.nombres?.[0] || ''}${jefe.apellidos?.[0] || ''}`
                    : 'JC';

                  return (
                    <div
                      key={fam.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#DCE4F2] hover:bg-indigo-200/60 transition border-2 border-indigo-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow">
                          {iniciales.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900 leading-tight">
                            {jefe
                              ? `${jefe.nombres} ${jefe.apellidos}`
                              : fam.nombre_familia}
                          </p>
                          <p className="text-xs font-bold text-indigo-800 mt-0.5">
                            {fam.calles?.nombre} • Casa #{fam.numero_casa}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-indigo-900 text-white font-extrabold text-xs">
                          {integrantesActivos.length} hab.
                        </span>
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Tarjeta Destacada */}
        <div className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-violet-950 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between border border-indigo-400/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Resumen Comunal
            </span>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
              Activo
            </span>
          </div>

          <div className="flex flex-col items-center text-center my-5">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-3 shadow-inner">
              <Award size={40} className="text-white" />
            </div>
            <h4 className="text-lg font-extrabold">Consejo Comunal</h4>
            <p className="text-xs text-indigo-200 mt-0.5">
              Control de Calles y Núcleos Familiares
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-[#E8EEF7] text-slate-900 rounded-2xl p-2.5 text-center shadow-md">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                Calles
              </p>
              <p className="text-lg font-black text-indigo-800">{calles.length}</p>
            </div>
            <div className="bg-[#E8EEF7] text-slate-900 rounded-2xl p-2.5 text-center shadow-md">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                Casas
              </p>
              <p className="text-lg font-black text-indigo-800">
                {resumen.totalFamilias}
              </p>
            </div>
            <div className="bg-[#E8EEF7] text-slate-900 rounded-2xl p-2.5 text-center shadow-md">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                Beneficios
              </p>
              <p className="text-lg font-black text-indigo-800">
                {resumen.conBeneficios}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 3: CRUD / PADRÓN GENERAL DE ALTA VISIBILIDAD */}
      <div className="bg-[#E8EEF7] rounded-3xl p-6 shadow-lg border-2 border-indigo-300">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-900 text-white">
              <FolderKanban size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-indigo-950">
                Padrón General y Gestión de Habitantes ({habitantesFiltrados.length} registros)
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Vista de alto contraste de todos los Jefes de Casa y cargas familiares
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filtroGrupo !== 'todos' && (
              <button
                onClick={() => setFiltroGrupo('todos')}
                className="text-xs font-extrabold bg-indigo-200 hover:bg-indigo-300 text-indigo-950 px-4 py-2 rounded-xl cursor-pointer"
              >
                Ver Todos
              </button>
            )}
            {irACalles && (
              <button
                onClick={irACalles}
                className="text-xs font-extrabold bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl shadow cursor-pointer"
              >
                + Registrar o Editar en Calles
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border-2 border-indigo-300 shadow-inner">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-900 text-white text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-extrabold">Habitante / Rol</th>
                <th className="py-3.5 px-4 font-extrabold">Cédula</th>
                <th className="py-3.5 px-4 font-extrabold">Edad / Sexo</th>
                <th className="py-3.5 px-4 font-extrabold">Calle y Casa</th>
                <th className="py-3.5 px-4 font-extrabold">Salud / Condición</th>
                <th className="py-3.5 px-4 font-extrabold">Beneficios</th>
                <th className="py-3.5 px-4 font-extrabold text-right">Acciones CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-indigo-200">
              {habitantesFiltrados.length === 0 ? (
                <tr className="bg-[#DCE4F2]">
                  <td
                    colSpan="7"
                    className="text-center py-10 text-indigo-950 font-extrabold text-sm"
                  >
                    No hay habitantes registrados todavía. Ve a "Calles y Familias" para agregar datos.
                  </td>
                </tr>
              ) : (
                habitantesFiltrados.map((h, idx) => {
                  const edad = calcularEdad(h.fecha_nacimiento);
                  const filaPar = idx % 2 === 0;
                  return (
                    <tr
                      key={h.id}
                      className={`${
                        filaPar ? 'bg-[#DCE4F2]' : 'bg-[#CFD9EC]'
                      } hover:bg-indigo-200/80 transition`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {h.nombres} {h.apellidos}
                        </p>
                        <span
                          className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold ${
                            h.es_jefe_familia
                              ? 'bg-indigo-700 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {h.parentesco}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">
                        {h.cedula || 'Sin C.I.'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {edad} años ({h.sexo === 'M' ? 'Hombre' : 'Mujer'})
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-950">
                        {h.familias?.calles?.nombre || 'Calle'} • Casa #
                        {h.familias?.numero_casa}
                      </td>
                      <td className="py-3.5 px-4">
                        {h.embarazada && (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-pink-600 text-white font-extrabold text-xs mr-1">
                            Embarazada ({h.semanas_embarazo || '?'} sem)
                          </span>
                        )}
                        {h.tiene_patologia ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-xs">
                            {h.detalle_patologia}
                          </span>
                        ) : (
                          !h.embarazada && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-300 text-slate-800 font-bold text-xs">
                              Sano
                            </span>
                          )
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {h.recibe_beneficio ? (
                          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-700 text-white font-extrabold text-xs">
                            {h.detalle_beneficio}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">
                            Ninguno
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={irACalles}
                            className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-extrabold cursor-pointer"
                          >
                            Gestionar
                          </button>
                          <button
                            onClick={() => handleEliminarDesdeDashboard(h)}
                            className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}