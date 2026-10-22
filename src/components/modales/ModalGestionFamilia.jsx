import { X, Baby, HeartPulse, Gift, Home, UserPlus } from 'lucide-react';

const BENEFICIOS_GENERALES = [
  'CLAP (Alimentación)',
  'Gas Comunal',
  'Bonos de la Patria',
  'Hogares de la Patria',
  'Amor Mayor (Pensión)',
  'José Gregorio Hernández',
];

const BENEFICIOS_MATERNOS = [
  'Parto Humanizado',
  'Lactancia Materna',
];

const OPCIONES_MATERNIDAD = [
  { label: 'No embarazada', valor: 'Sana' },
  { label: 'Embarazada', valor: 'Embarazada' },
  { label: 'Embarazo de riesgo', valor: 'Embarazo de riesgo' },
  { label: 'Lactancia materna', valor: 'Lactancia materna' },
  { label: 'Postparto', valor: 'Postparto' },
];

const soloLetrasMax28 = (valor) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 28);

const soloNumeros = (valor, max = 11) =>
  valor.replace(/[^0-9]/g, '').slice(0, max);

const fechaHoy = new Date().toISOString().split('T')[0];

export function ModalFamilia({
  abierto,
  onCerrar,
  onSubmit,
  form,
  setForm,
  calles,
  procesando,
  toggleBeneficio,
}) {
  if (!abierto) return null;

  const esFemenino = form.sexo_jefe === 'F';
  const beneficiosDisponibles = esFemenino
    ? [...BENEFICIOS_GENERALES, ...BENEFICIOS_MATERNOS]
    : BENEFICIOS_GENERALES;

  const manejarCambioSexoJefe = (nuevoSexo) => {
    let nuevaSalud = form.condicion_salud_jefe;
    let nuevosBeneficios = form.beneficios_jefe || [];

    if (nuevoSexo === 'M') {
      const valoresMaternos = OPCIONES_MATERNIDAD.map((o) => o.valor);
      if (valoresMaternos.includes(nuevaSalud)) {
        nuevaSalud = 'Sano';
      }
      nuevosBeneficios = nuevosBeneficios.filter(
        (b) => !BENEFICIOS_MATERNOS.includes(b)
      );
    }

    setForm({
      ...form,
      sexo_jefe: nuevoSexo,
      condicion_salud_jefe: nuevaSalud,
      beneficios_jefe: nuevosBeneficios,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-2xl border border-indigo-100 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 sm:px-8 sm:py-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Home size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Registrar Jefe de Casa y Vivienda
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 font-semibold mt-0.5">
                Nombres: solo letras (máx. 28) • Cédula, Casa y Teléfono: solo números
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Calle de la Vivienda
              </label>
              <select
                required
                value={form.calle_id}
                onChange={(e) => setForm({ ...form, calle_id: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              >
                <option value="">Selecciona una calle...</option>
                {calles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Número de Casa (Solo números)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                placeholder="Ej: 14"
                value={form.numero_casa}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numero_casa: soloNumeros(e.target.value, 6),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                  Nombres del Jefe(a)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {form.nombres_jefe.length}/28
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={28}
                placeholder="Solo letras (Ej: Maria Elena)"
                value={form.nombres_jefe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombres_jefe: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                  Apellidos del Jefe(a)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {form.apellidos_jefe.length}/28
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={28}
                placeholder="Solo letras (Ej: Perez Gomez)"
                value={form.apellidos_jefe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    apellidos_jefe: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Cédula (Solo números)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={9}
                placeholder="Ej: 14500200"
                value={form.cedula_jefe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cedula_jefe: soloNumeros(e.target.value, 9),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                required
                max={fechaHoy}
                value={form.fecha_nacimiento_jefe}
                onChange={(e) =>
                  setForm({ ...form, fecha_nacimiento_jefe: e.target.value })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Sexo
              </label>
              <select
                value={form.sexo_jefe}
                onChange={(e) => manejarCambioSexoJefe(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition cursor-pointer"
              >
                <option value="F">Femenino (F)</option>
                <option value="M">Masculino (M)</option>
              </select>
            </div>
          </div>

          {esFemenino && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-50/90 via-rose-50/70 to-purple-50/90 border-2 border-pink-200/80 space-y-3">
              <div className="flex items-center gap-2.5 text-pink-700">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0">
                  <Baby size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    Condición de Embarazo o Maternidad (Femenino)
                  </h4>
                  <p className="text-xs text-pink-600 font-semibold">
                    Si está embarazada o amamantando, selecciona una opción:
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {OPCIONES_MATERNIDAD.map((opcion) => {
                  const seleccionado =
                    form.condicion_salud_jefe.toLowerCase() ===
                    opcion.valor.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={opcion.label}
                      onClick={() =>
                        setForm({ ...form, condicion_salud_jefe: opcion.valor })
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition cursor-pointer ${
                        seleccionado
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-600/20'
                          : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-100/60'
                      }`}
                    >
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Teléfono (Solo números)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="Ej: 04121234567"
                value={form.telefono_contacto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    telefono_contacto: soloNumeros(e.target.value, 11),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <HeartPulse size={15} className="text-rose-500" />
                  Estado de Salud (Solo letras)
                </label>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {form.condicion_salud_jefe.length}/28
                </span>
              </div>
              <input
                type="text"
                maxLength={28}
                placeholder="Ej: Sano, Hipertension"
                value={form.condicion_salud_jefe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    condicion_salud_jefe: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-3 flex items-center gap-1.5">
              <Gift size={16} className="text-indigo-600" />
              Beneficios o Ayudas que Recibe
            </label>
            <div className="flex flex-wrap gap-2.5">
              {beneficiosDisponibles.map((ben) => {
                const activo = form.beneficios_jefe.includes(ben);
                const esMaterno = BENEFICIOS_MATERNOS.includes(ben);
                return (
                  <button
                    type="button"
                    key={ben}
                    onClick={() => toggleBeneficio(ben, true)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition cursor-pointer ${
                      activo
                        ? esMaterno
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : esMaterno
                        ? 'bg-pink-50/70 text-pink-800 border-pink-200 hover:bg-pink-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {ben}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className="px-8 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/25 transition cursor-pointer text-center"
            >
              {procesando ? 'Guardando...' : 'Guardar Familia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalHabitante({
  abierto,
  onCerrar,
  onSubmit,
  form,
  setForm,
  esEdicion,
  procesando,
  toggleBeneficio,
}) {
  if (!abierto) return null;

  const esFemenino = form.sexo === 'F';
  const beneficiosDisponibles = esFemenino
    ? [...BENEFICIOS_GENERALES, ...BENEFICIOS_MATERNOS]
    : BENEFICIOS_GENERALES;

  const manejarCambioSexoHabitante = (nuevoSexo) => {
    let nuevaSalud = form.condicion_salud;
    let nuevosBeneficios = form.beneficios || [];

    if (nuevoSexo === 'M') {
      const valoresMaternos = OPCIONES_MATERNIDAD.map((o) => o.valor);
      if (valoresMaternos.includes(nuevaSalud)) {
        nuevaSalud = 'Sano';
      }
      nuevosBeneficios = nuevosBeneficios.filter(
        (b) => !BENEFICIOS_MATERNOS.includes(b)
      );
    }

    setForm({
      ...form,
      sexo: nuevoSexo,
      condicion_salud: nuevaSalud,
      beneficios: nuevosBeneficios,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-2xl border border-indigo-100 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 sm:px-8 sm:py-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <UserPlus size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                {esEdicion ? 'Editar Datos de la Persona' : 'Agregar Familiar a la Vivienda'}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 font-semibold mt-0.5">
                Nombres: solo letras (máx. 28) • Cédula: solo números
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                  Nombres (Solo letras)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {form.nombres.length}/28
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={28}
                placeholder="Ej: Carla Alejandra"
                value={form.nombres}
                onChange={(e) =>
                  setForm({ ...form, nombres: soloLetrasMax28(e.target.value) })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                  Apellidos (Solo letras)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {form.apellidos.length}/28
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={28}
                placeholder="Ej: Perez Gomez"
                value={form.apellidos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    apellidos: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Cédula (Solo números)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="Opcional en niños"
                value={form.cedula}
                onChange={(e) =>
                  setForm({ ...form, cedula: soloNumeros(e.target.value, 9) })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                required
                max={fechaHoy}
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm({ ...form, fecha_nacimiento: e.target.value })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Parentesco (Solo letras)
              </label>
              <input
                type="text"
                required
                maxLength={28}
                placeholder="Ej: Hija, Esposa"
                value={form.parentesco}
                onChange={(e) =>
                  setForm({
                    ...form,
                    parentesco: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-2">
                Sexo
              </label>
              <select
                value={form.sexo}
                onChange={(e) => manejarCambioSexoHabitante(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition cursor-pointer"
              >
                <option value="F">Femenino (F)</option>
                <option value="M">Masculino (M)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <HeartPulse size={15} className="text-rose-500" />
                  Salud (Solo letras)
                </label>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {form.condicion_salud.length}/28
                </span>
              </div>
              <input
                type="text"
                maxLength={28}
                placeholder="Ej: Sano, Embarazada"
                value={form.condicion_salud}
                onChange={(e) =>
                  setForm({
                    ...form,
                    condicion_salud: soloLetrasMax28(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {esFemenino && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-50/90 via-rose-50/70 to-purple-50/90 border-2 border-pink-200/80 space-y-3">
              <div className="flex items-center gap-2.5 text-pink-700">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0">
                  <Baby size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    Condición de Embarazo o Maternidad (Femenino)
                  </h4>
                  <p className="text-xs text-pink-600 font-semibold">
                    Selecciona una opción rápida si aplica:
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {OPCIONES_MATERNIDAD.map((opcion) => {
                  const seleccionado =
                    form.condicion_salud.toLowerCase() ===
                    opcion.valor.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={opcion.label}
                      onClick={() =>
                        setForm({ ...form, condicion_salud: opcion.valor })
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition cursor-pointer ${
                        seleccionado
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-600/20'
                          : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-100/60'
                      }`}
                    >
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700 mb-3 flex items-center gap-1.5">
              <Gift size={16} className="text-indigo-600" />
              Beneficios que Recibe
            </label>
            <div className="flex flex-wrap gap-2.5">
              {beneficiosDisponibles.map((ben) => {
                const activo = form.beneficios.includes(ben);
                const esMaterno = BENEFICIOS_MATERNOS.includes(ben);
                return (
                  <button
                    type="button"
                    key={ben}
                    onClick={() => toggleBeneficio(ben, false)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition cursor-pointer ${
                      activo
                        ? esMaterno
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : esMaterno
                        ? 'bg-pink-50/70 text-pink-800 border-pink-200 hover:bg-pink-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {ben}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className="px-8 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/25 transition cursor-pointer text-center"
            >
              {procesando ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}