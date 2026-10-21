import { useState } from 'react';
import {
  calcularEdad,
  obtenerResumenEstadistico,
} from '../../utils/calculosDemograficos';
import {
  PieChart,
  Baby,
  UserCheck,
  HeartPulse,
  Gift,
  Sparkles,
  Flame,
  PackageCheck,
  Wallet,
} from 'lucide-react';

export default function DemografiaSaludView({
  habitantes = [],
  familias = [],
  modo = 'demografia', // 'demografia' | 'salud_beneficios'
  busquedaGlobal = '',
}) {
  const [filtroBeneficio, setFiltroBeneficio] = useState('todos');

  const resumen = obtenerResumenEstadistico(habitantes, familias);
  const habitantesActivos = habitantes.filter((h) => h.estado === 'activo');
  const totalBase = Math.max(resumen.totalHabitantes, 1);

  // Conteos específicos de beneficios clave
  const recibenClap = habitantesActivos.filter(
    (h) => h.recibe_beneficio && (h.detalle_beneficio || '').toLowerCase().includes('clap')
  ).length;

  const recibenBonos = habitantesActivos.filter(
    (h) =>
      h.recibe_beneficio &&
      (h.detalle_beneficio || '').toLowerCase().includes('bono')
  ).length;

  const recibenGas = habitantesActivos.filter(
    (h) =>
      h.recibe_beneficio &&
      (h.detalle_beneficio || '').toLowerCase().includes('gas')
  ).length;

  const indicadoresDemograficos = [
    {
      label: 'Niños (< 12 años)',
      cantidad: resumen.ninosMenores12,
      porcentaje: Math.round((resumen.ninosMenores12 / totalBase) * 100),
      color: 'bg-amber-500',
      fondo: 'bg-amber-50 text-amber-700 border-amber-200',
      descripcion: 'Varones menores de 12 años censados',
    },
    {
      label: 'Niñas (< 12 años)',
      cantidad: resumen.ninasMenores12,
      porcentaje: Math.round((resumen.ninasMenores12 / totalBase) * 100),
      color: 'bg-orange-500',
      fondo: 'bg-orange-50 text-orange-700 border-orange-200',
      descripcion: 'Hembras menores de 12 años censadas',
    },
    {
      label: 'Mujeres Mayores (> 55 años)',
      cantidad: resumen.mujeresMayores55,
      porcentaje: Math.round((resumen.mujeresMayores55 / totalBase) * 100),
      color: 'bg-purple-600',
      fondo: 'bg-purple-50 text-purple-700 border-purple-200',
      descripcion: 'Adultas mayores a partir de 56 años',
    },
    {
      label: 'Hombres Mayores (> 60 años)',
      cantidad: resumen.hombresMayores60,
      porcentaje: Math.round((resumen.hombresMayores60 / totalBase) * 100),
      color: 'bg-teal-600',
      fondo: 'bg-teal-50 text-teal-700 border-teal-200',
      descripcion: 'Adultos mayores a partir de 61 años',
    },
    {
      label: 'Mujeres Embarazadas',
      cantidad: resumen.embarazadas,
      porcentaje: Math.round((resumen.embarazadas / totalBase) * 100),
      color: 'bg-pink-500',
      fondo: 'bg-pink-50 text-pink-700 border-pink-200',
      descripcion: 'Gestantes activas en control',
    },
    {
      label: 'Habitantes con Patologías',
      cantidad: resumen.conPatologias,
      porcentaje: Math.round((resumen.conPatologias / totalBase) * 100),
      color: 'bg-rose-500',
      fondo: 'bg-rose-50 text-rose-700 border-rose-200',
      descripcion: 'Personas con condición médica registrada',
    },
    {
      label: 'Habitantes que Reciben Beneficios',
      cantidad: resumen.conBeneficios,
      porcentaje: Math.round((resumen.conBeneficios / totalBase) * 100),
      color: 'bg-emerald-600',
      fondo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      descripcion: 'CLAP, Bonos de la Patria, Gas Comunal y otros',
    },
  ];

  if (modo === 'demografia') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <PieChart size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Distribución Demográfica de la Comunidad
              </h1>
              <p className="text-sm text-slate-500">
                Estadísticas ampliadas en tiempo real sobre un padrón de{' '}
                <span className="font-bold text-indigo-700">
                  {resumen.totalHabitantes} habitantes activos
                </span>{' '}
                y{' '}
                <span className="font-bold text-indigo-700">
                  {resumen.totalFamilias} familias
                </span>
                .
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-sm self-start md:self-center">
            100% Sincronizado
          </span>
        </div>

        {/* Gráfica de barras grande y de alta visibilidad */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">
            Proporción por Grupos Prioritarios de la Comunidad
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {indicadoresDemograficos.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500">{item.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3.5 py-1.5 rounded-xl border text-sm font-extrabold ${item.fondo}`}
                    >
                      {item.cantidad} habitantes
                    </span>
                    <span className="text-lg font-black text-slate-800 w-14 text-right">
                      {item.porcentaje}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(item.porcentaje, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MODO: SALUD Y BENEFICIOS (CLAP, BONOS DE LA PATRIA, GAS COMUNAL, PATOLOGÍAS, EMBARAZADAS)
  const listaFiltradaSalud = habitantesActivos.filter((h) => {
    const texto = `${h.nombres} ${h.apellidos} ${h.cedula || ''} ${h.detalle_beneficio || ''} ${h.detalle_patologia || ''}`.toLowerCase();
    if (busquedaGlobal && !texto.includes(busquedaGlobal.toLowerCase())) return false;

    if (filtroBeneficio === 'clap') {
      return h.recibe_beneficio && (h.detalle_beneficio || '').toLowerCase().includes('clap');
    }
    if (filtroBeneficio === 'bonos') {
      return h.recibe_beneficio && (h.detalle_beneficio || '').toLowerCase().includes('bono');
    }
    if (filtroBeneficio === 'gas') {
      return h.recibe_beneficio && (h.detalle_beneficio || '').toLowerCase().includes('gas');
    }
    if (filtroBeneficio === 'patologias') {
      return h.tiene_patologia;
    }
    if (filtroBeneficio === 'embarazadas') {
      return h.sexo === 'F' && h.embarazada;
    }
    return h.recibe_beneficio || h.tiene_patologia || h.embarazada;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Salud Comunitaria y Beneficios Sociales
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Control detallado de CLAP, Bonos de la Patria, Gas Comunal, gestantes y patologías médicas.
        </p>
      </div>

      {/* Tarjetas de filtro rápido de beneficios y salud */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setFiltroBeneficio('clap')}
          className={`p-5 rounded-3xl bg-white border text-left transition cursor-pointer shadow-sm ${
            filtroBeneficio === 'clap' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-100'
          }`}
        >
          <PackageCheck size={26} className="text-emerald-600 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800">{recibenClap}</p>
          <p className="text-sm font-bold text-slate-600">Beneficio CLAP</p>
        </button>

        <button
          onClick={() => setFiltroBeneficio('bonos')}
          className={`p-5 rounded-3xl bg-white border text-left transition cursor-pointer shadow-sm ${
            filtroBeneficio === 'bonos' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-100'
          }`}
        >
          <Wallet size={26} className="text-indigo-600 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800">{recibenBonos}</p>
          <p className="text-sm font-bold text-slate-600">Bonos de la Patria</p>
        </button>

        <button
          onClick={() => setFiltroBeneficio('gas')}
          className={`p-5 rounded-3xl bg-white border text-left transition cursor-pointer shadow-sm ${
            filtroBeneficio === 'gas' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-100'
          }`}
        >
          <Flame size={26} className="text-orange-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800">{recibenGas}</p>
          <p className="text-sm font-bold text-slate-600">Gas Comunal</p>
        </button>

        <button
          onClick={() => setFiltroBeneficio('patologias')}
          className={`p-5 rounded-3xl bg-white border text-left transition cursor-pointer shadow-sm ${
            filtroBeneficio === 'patologias' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-100'
          }`}
        >
          <HeartPulse size={26} className="text-rose-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800">{resumen.conPatologias}</p>
          <p className="text-sm font-bold text-slate-600">Con Patologías</p>
        </button>

        <button
          onClick={() => setFiltroBeneficio('embarazadas')}
          className={`p-5 rounded-3xl bg-white border text-left transition cursor-pointer shadow-sm ${
            filtroBeneficio === 'embarazadas' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-100'
          }`}
        >
          <Sparkles size={26} className="text-pink-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800">{resumen.embarazadas}</p>
          <p className="text-sm font-bold text-slate-600">Embarazadas</p>
        </button>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-800">
            Habitantes Filtrados ({listaFiltradaSalud.length})
          </h3>
          {filtroBeneficio !== 'todos' && (
            <button
              onClick={() => setFiltroBeneficio('todos')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Ver Todos
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                <th className="py-3 px-3">Habitante</th>
                <th className="py-3 px-3">Cédula</th>
                <th className="py-3 px-3">Edad</th>
                <th className="py-3 px-3">Ubicación</th>
                <th className="py-3 px-3">Condición / Salud</th>
                <th className="py-3 px-3">Beneficios Asignados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaFiltradaSalud.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {h.nombres} {h.apellidos}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{h.cedula || 'S/C'}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {calcularEdad(h.fecha_nacimiento)} años
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {h.familias?.calles?.nombre} • Casa #{h.familias?.numero_casa}
                  </td>
                  <td className="py-3 px-3">
                    {h.embarazada && (
                      <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-bold mr-1">
                        Embarazada ({h.semanas_embarazo || '?'} sem)
                      </span>
                    )}
                    {h.tiene_patologia ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold">
                        {h.detalle_patologia}
                      </span>
                    ) : (
                      !h.embarazada && <span className="text-slate-400 text-xs">Sano</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {h.recibe_beneficio ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                        {h.detalle_beneficio}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Ninguno</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}