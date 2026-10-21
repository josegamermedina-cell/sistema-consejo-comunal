import { useState } from 'react';
import {
  Home,
  Users,
  Gift,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  MapPin,
  UserCheck,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { calcularEdad } from '../../utils/calculosDemograficos';

/**
 * ESPACIOS DE IMÁGENES PARA CADA BLOQUE DEL PANEL PRINCIPAL.
 * Puedes colocar imágenes diferentes en la carpeta "public/" y cambiar aquí sus nombres:
 */
const IMAGENES_DASHBOARD = {
  cardFamilias: '/registro.png',
  cardHabitantes: '/logins.jpg',
  cardBeneficios: '/registro.png',
  resumenComunal: '/logins.jpg',
  estadoVacioFamilias: '/registro.png',
};

export default function DashboardView({
  habitantes = [],
  familias = [],
  calles = [],
  busquedaGlobal = '',
  irACalles,
}) {
  // Buscador propio de la tabla inferior (funciona en conjunto con el buscador de arriba)
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [filtroCalle, setFiltroCalle] = useState('TODAS');

  const totalFamilias = familias.length;
  const totalHabitantes = habitantes.length;
  const totalConBeneficios = habitantes.filter(
    (h) => Array.isArray(h.beneficios) && h.beneficios.length > 0
  ).length;

  // Une lo que se escriba en el buscador de arriba o en el buscador de abajo
  const textoBusqueda = (busquedaTabla || busquedaGlobal).trim().toLowerCase();

  // Filtra los habitantes según el texto buscado y la calle seleccionada
  const habitantesFiltrados = habitantes.filter((h) => {
    const nombreCalle = h.familias?.calles?.nombre || '';
    if (filtroCalle !== 'TODAS' && nombreCalle !== filtroCalle) {
      return false;
    }

    if (!textoBusqueda) return true;

    const nombreCompleto = `${h.nombres || ''} ${h.apellidos || ''}`.toLowerCase();
    const cedula = (h.cedula || '').toLowerCase();
    const calle = nombreCalle.toLowerCase();
    const casa = (h.familias?.numero_casa || '').toLowerCase();
    const salud = (h.condicion_salud || '').toLowerCase();
    const beneficios = Array.isArray(h.beneficios)
      ? h.beneficios.join(' ').toLowerCase()
      : '';

    return (
      nombreCompleto.includes(textoBusqueda) ||
      cedula.includes(textoBusqueda) ||
      calle.includes(textoBusqueda) ||
      casa.includes(textoBusqueda) ||
      salud.includes(textoBusqueda) ||
      beneficios.includes(textoBusqueda)
    );
  });

  // También filtra las tarjetas de Jefes de Casa cuando se busca algo
  const familiasFiltradas = familias.filter((fam) => {
    if (!textoBusqueda) return true;
    const jefe =
      (fam.habitantes || []).find((h) => h.es_jefe_familia) ||
      (fam.habitantes || [])[0];
    const nombreJefe = jefe
      ? `${jefe.nombres || ''} ${jefe.apellidos || ''} ${jefe.cedula || ''}`.toLowerCase()
      : '';
    const nombreFam = (fam.nombre_familia || '').toLowerCase();
    const calle = (fam.calles?.nombre || '').toLowerCase();
    const casa = (fam.numero_casa || '').toLowerCase();

    return (
      nombreJefe.includes(textoBusqueda) ||
      nombreFam.includes(textoBusqueda) ||
      calle.includes(textoBusqueda) ||
      casa.includes(textoBusqueda)
    );
  });

  const familiasRecientes = familiasFiltradas.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* AVISO VERDE CUANDO HAY UNA BÚSQUEDA ACTIVA */}
      {textoBusqueda && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
            <p className="text-sm font-extrabold">
              Mostrando resultados para: <span className="underline">&ldquo;{busquedaTabla || busquedaGlobal}&rdquo;</span> ({habitantesFiltrados.length} vecinos encontrados)
            </p>
          </div>
          {busquedaTabla && (
            <button
              onClick={() => setBusquedaTabla('')}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
            >
              Ver todos
            </button>
          )}
        </div>
      )}

      {/* 1. TARJETAS SUPERIORES CON TIPOGRAFÍA MÁS GRANDE */}
      <div className="grid grid-cols-3 gap-5">
        {/* Tarjeta 1: Total Familias */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-indigo-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
              <Home size={14} /> Hogares
            </span>
            <h3 className="text-4xl font-black text-slate-900 mt-2.5 leading-none">
              {totalFamilias}
            </h3>
            <p className="text-base font-extrabold text-slate-800 mt-1.5">
              Total Familias
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Casas registradas en la comunidad
            </p>
          </div>

          <div className="w-22 h-22 rounded-2xl bg-gradient-to-br from-indigo-50 to-[#EFD0ED]/50 border border-indigo-100 p-2.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img
              src={IMAGENES_DASHBOARD.cardFamilias}
              alt="Familias"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Tarjeta 2: Total Habitantes */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-indigo-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
              <Users size={14} /> Vecinos
            </span>
            <h3 className="text-4xl font-black text-slate-900 mt-2.5 leading-none">
              {totalHabitantes}
            </h3>
            <p className="text-base font-extrabold text-slate-800 mt-1.5">
              Total Habitantes
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Personas anotadas en el sector
            </p>
          </div>

          <div className="w-22 h-22 rounded-2xl bg-gradient-to-br from-purple-50 to-[#EFD0ED]/60 border border-purple-100 p-2.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img
              src={IMAGENES_DASHBOARD.cardHabitantes}
              alt="Habitantes"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Tarjeta 3: Reciben Beneficios */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-indigo-100/80 flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              <Gift size={14} /> Ayudas y Entregas
            </span>
            <h3 className="text-4xl font-black text-slate-900 mt-2.5 leading-none">
              {totalConBeneficios}
            </h3>
            <p className="text-base font-extrabold text-slate-800 mt-1.5">
              Reciben Beneficios
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Alimentación • Bonos • Gas Comunal
            </p>
          </div>

          <div className="w-22 h-22 rounded-2xl bg-gradient-to-br from-blue-50 to-[#EFD0ED]/50 border border-blue-100 p-2.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img
              src={IMAGENES_DASHBOARD.cardBeneficios}
              alt="Beneficios"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* 2. FILA CENTRAL: JEFES DE CASA + TARJETA DE RESUMEN COMUNAL */}
      <div className="grid grid-cols-3 gap-5">
        {/* Columna Izquierda (2/3): Jefes de Casa Registrados */}
        <div className="col-span-2 bg-white rounded-[28px] p-6 shadow-sm border border-indigo-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Jefes de Casa Registrados Recientemente
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Familias anotadas en cada calle de la comunidad
              </p>
            </div>

            <button
              onClick={irACalles}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer"
            >
              <span>Ver y Registrar Familias</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {familiasRecientes.length === 0 ? (
            <div className="flex-1 rounded-2xl border-2 border-dashed border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-[#EFD0ED]/25 p-6 flex items-center justify-center gap-5">
              <div className="w-18 h-18 rounded-2xl bg-white p-3 shadow-sm border border-indigo-100 shrink-0 flex items-center justify-center">
                <img
                  src={IMAGENES_DASHBOARD.estadoVacioFamilias}
                  alt="Sin registros"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-base font-black text-indigo-950">
                  Todavía no hay familias registradas.
                </p>
                <p className="text-sm text-slate-600 font-medium mt-1">
                  Haz clic en el botón &ldquo;Ver y Registrar Familias&rdquo; para anotar al primer Jefe de Casa.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 my-auto">
              {familiasRecientes.map((fam) => {
                const jefe =
                  (fam.habitantes || []).find((h) => h.es_jefe_familia) ||
                  (fam.habitantes || [])[0];
                return (
                  <div
                    key={fam.id}
                    className="p-4 rounded-2xl bg-slate-50/90 hover:bg-indigo-50/60 border border-slate-200 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        <UserCheck size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">
                          {jefe
                            ? `${jefe.nombres} ${jefe.apellidos}`
                            : fam.nombre_familia || 'Familia registrada'}
                        </p>
                        <p className="text-xs text-indigo-600 font-bold truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={13} />
                          {fam.calles?.nombre || 'Calle'} • Casa {fam.numero_casa || 'S/N'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white border border-indigo-100 text-xs font-black text-indigo-700 shrink-0">
                      {(fam.habitantes || []).length} integrantes
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha (1/3): RESUMEN COMUNAL */}
        <div
          className="rounded-[28px] p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/60"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #EFD0ED 100%)',
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-100">
              RESUMEN COMUNAL
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-black text-white shadow-sm">
              Activo
            </span>
          </div>

          <div className="my-4 flex flex-col items-center text-center relative z-10">
            <div className="w-30 h-24 rounded-2xl bg-white/95 backdrop-blur-md p-2.5 shadow-md border border-white flex items-center justify-center overflow-hidden mb-3">
              <img
                src={IMAGENES_DASHBOARD.resumenComunal}
                alt="Resumen Comunal"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">
              Comuna Activa
            </h3>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              Organización de Calles y Familias
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 relative z-10">
            <div className="bg-white/95 rounded-2xl p-3 text-center shadow-sm">
              <span className="block text-[10px] font-black uppercase text-slate-500">
                CALLES
              </span>
              <span className="text-lg font-black text-indigo-700">
                {calles.length}
              </span>
            </div>
            <div className="bg-white/95 rounded-2xl p-3 text-center shadow-sm">
              <span className="block text-[10px] font-black uppercase text-slate-500">
                CASAS
              </span>
              <span className="text-lg font-black text-indigo-700">
                {totalFamilias}
              </span>
            </div>
            <div className="bg-white/95 rounded-2xl p-3 text-center shadow-sm">
              <span className="block text-[10px] font-black uppercase text-slate-500">
                AYUDAS
              </span>
              <span className="text-lg font-black text-indigo-700">
                {totalConBeneficios}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTA GENERAL DE VECINOS CON BUSCADOR FUNCIONAL INTEGRADO */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-indigo-100/80">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-sm shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Lista General de Vecinos ({habitantesFiltrados.length} personas)
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Todos los Jefes de Casa y familiares registrados en la comunidad
              </p>
            </div>
          </div>

          <button
            onClick={irACalles}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Agregar o Editar en Calles</span>
          </button>
        </div>

        {/* BUSCADOR INFERIOR Y FILTRO POR CALLE 100% FUNCIONALES */}
        <div className="flex items-center gap-4 mb-5 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-indigo-500" />
            <input
              type="text"
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
              placeholder="Escribe aquí para buscar vecino por nombre, apellido, cédula, calle, casa o beneficio..."
              className="w-full bg-white border border-indigo-200 rounded-xl pl-11 pr-10 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
            />
            {busquedaTabla && (
              <button
                onClick={() => setBusquedaTabla('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <select
            value={filtroCalle}
            onChange={(e) => setFiltroCalle(e.target.value)}
            className="bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="TODAS">Todas las calles ({calles.length})</option>
            {calles.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="text-white text-xs font-black uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #4f46e5 60%, #7e22ce 100%)',
                }}
              >
                <th className="py-4 px-4">Vecino / Parentesco</th>
                <th className="py-4 px-4">Cédula</th>
                <th className="py-4 px-4">Edad y Sexo</th>
                <th className="py-4 px-4">Calle y Casa</th>
                <th className="py-4 px-4">Estado de Salud</th>
                <th className="py-4 px-4">Beneficios que Recibe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {habitantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-600 font-bold text-sm">
                    {textoBusqueda || filtroCalle !== 'TODAS'
                      ? 'No se encontraron vecinos con esa búsqueda. Prueba con otro nombre o cédula.'
                      : 'Todavía no hay vecinos registrados. Ve a la sección "Calles y Familias" para agregar datos.'}
                  </td>
                </tr>
              ) : (
                habitantesFiltrados.map((h) => {
                  const edad = calcularEdad(h.fecha_nacimiento);
                  return (
                    <tr key={h.id} className="hover:bg-indigo-50/40 transition">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {h.nombres} {h.apellidos}
                        {h.es_jefe_familia && (
                          <span className="ml-2 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-black">
                            Jefe de Casa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {h.cedula || 'Sin cédula'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {edad !== null ? `${edad} años` : '-'} • {h.sexo || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {h.familias?.calles?.nombre || '-'} (Casa {h.familias?.numero_casa || 'S/N'})
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {h.condicion_salud || 'Sano'}
                      </td>
                      <td className="py-3.5 px-4">
                        {Array.isArray(h.beneficios) && h.beneficios.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {h.beneficios.map((b, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">
                            Ninguno
                          </span>
                        )}
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