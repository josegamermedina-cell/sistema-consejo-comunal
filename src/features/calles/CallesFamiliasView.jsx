import { useState } from 'react';
import { calcularEdad } from '../../utils/calculosDemograficos';
import {
  crearCalle,
  registrarFamiliaYJefe,
  agregarIntegrante,
  actualizarHabitante,
  eliminarHabitante,
  eliminarFamiliaCompleta,
} from '../../services/censoService';
import {
  MapPin,
  Plus,
  UserPlus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Home,
  Phone,
  AlertCircle,
  Check,
} from 'lucide-react';

const OPCIONES_BENEFICIOS = ['CLAP', 'Bonos de la Patria', 'Gas Comunal'];

// LÍMITES ESTRICTOS DE CARACTERES PARA EVITAR TEXTOS GIGANTES
const LIMITES = {
  NOMBRE_CALLE: 45,
  SECTOR: 45,
  LIDER: 40,
  NUMERO_CASA: 12,
  NOMBRE_FAMILIA: 40,
  CEDULA: 9,
  NOMBRES: 40,
  APELLIDOS: 40,
  TELEFONO: 11,
  SEMANAS: 2,
  PATOLOGIA: 100,
  OTRO_BENEFICIO: 80,
};

export default function CallesFamiliasView({
  calles,
  familias,
  recargarDatos,
  busquedaGlobal = '',
}) {
  const [calleSeleccionada, setCalleSeleccionada] = useState('todas');
  const [familiaExpandida, setFamiliaExpandida] = useState(null);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Modales
  const [modalCalle, setModalCalle] = useState(false);
  const [modalNuevaFamilia, setModalNuevaFamilia] = useState(false);
  const [modalIntegrante, setModalIntegrante] = useState(null);
  const [modalEditarPersona, setModalEditarPersona] = useState(null);

  const [formCalle, setFormCalle] = useState({
    nombre: '',
    sector: '',
    lider_calle: '',
  });

  const estadoInicialFamilia = {
    calle_id: '',
    numero_casa: '',
    nombre_familia: '',
    cedula: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'F',
    telefono: '',
    embarazada: false,
    semanas_embarazo: '',
    tiene_patologia: false,
    detalle_patologia: '',
    recibe_beneficio: false,
    beneficios_seleccionados: ['CLAP', 'Gas Comunal'],
    otro_beneficio: '',
  };
  const [formFamilia, setFormFamilia] = useState(estadoInicialFamilia);

  const estadoInicialPersona = {
    cedula: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'F',
    telefono: '',
    parentesco: 'Hijo(a)',
    embarazada: false,
    semanas_embarazo: '',
    tiene_patologia: false,
    detalle_patologia: '',
    recibe_beneficio: false,
    beneficios_seleccionados: ['CLAP'],
    otro_beneficio: '',
  };
  const [formPersona, setFormPersona] = useState(estadoInicialPersona);

  // FUNCIONES SANITIZADORAS ESTRICTAS (Cortan longitud y filtran caracteres en vivo)
  const soloNumeros = (valor, max) => valor.replace(/\D/g, '').slice(0, max);

  const soloLetras = (valor, max) =>
    valor
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
      .replace(/\s{2,}/g, ' ')
      .slice(0, max);

  const textoSeguro = (valor, max) =>
    valor
      .replace(/[<>{}[\]\\]/g, '')
      .replace(/\s{2,}/g, ' ')
      .slice(0, max);

  const construirTextoBeneficios = (seleccionados = [], otro = '') => {
    const lista = [...seleccionados];
    if (otro && otro.trim()) lista.push(otro.trim().slice(0, LIMITES.OTRO_BENEFICIO));
    return lista.join(', ');
  };

  const toggleBeneficio = (opcion, esFormularioFamilia) => {
    if (esFormularioFamilia) {
      const existe = formFamilia.beneficios_seleccionados.includes(opcion);
      const nuevos = existe
        ? formFamilia.beneficios_seleccionados.filter((b) => b !== opcion)
        : [...formFamilia.beneficios_seleccionados, opcion];
      setFormFamilia({ ...formFamilia, beneficios_seleccionados: nuevos });
    } else {
      const existe = formPersona.beneficios_seleccionados.includes(opcion);
      const nuevos = existe
        ? formPersona.beneficios_seleccionados.filter((b) => b !== opcion)
        : [...formPersona.beneficios_seleccionados, opcion];
      setFormPersona({ ...formPersona, beneficios_seleccionados: nuevos });
    }
  };

  // VALIDACIÓN AL MILÍMETRO DE CADA CAMPO
  const validarDatosPersona = (datos, exigirCedula = true) => {
    const nombres = datos.nombres.trim();
    const apellidos = datos.apellidos.trim();
    const cedula = datos.cedula.trim();
    const telefono = datos.telefono.trim();

    if (nombres.length < 2 || nombres.length > LIMITES.NOMBRES) {
      return `El nombre debe tener entre 2 y ${LIMITES.NOMBRES} letras.`;
    }
    if (apellidos.length < 2 || apellidos.length > LIMITES.APELLIDOS) {
      return `El apellido debe tener entre 2 y ${LIMITES.APELLIDOS} letras.`;
    }
    if (exigirCedula && !cedula) {
      return 'La cédula es obligatoria para personas de 10 años o más y Jefes de Casa.';
    }
    if (cedula) {
      if (cedula.startsWith('0')) {
        return 'La cédula no puede comenzar con el número cero (0).';
      }
      if (cedula.length < 6 || cedula.length > LIMITES.CEDULA) {
        return 'La cédula debe tener entre 6 y 9 dígitos numéricos exactos.';
      }
    }
    if (telefono) {
      if (telefono.length !== 11) {
        return 'El teléfono debe tener exactamente 11 dígitos numéricos (Ej: 04121234567).';
      }
      if (!/^(0412|0414|0424|0416|0426|02\d{2})\d{7}$/.test(telefono)) {
        return 'El teléfono debe iniciar con un código válido (0412, 0414, 0424, 0416, 0426 o 02XX).';
      }
    }
    if (!datos.fecha_nacimiento) {
      return 'La fecha de nacimiento es obligatoria.';
    }
    const fechaNac = new Date(datos.fecha_nacimiento);
    const hoy = new Date();
    if (fechaNac > hoy) {
      return 'La fecha de nacimiento no puede ser mayor al día de hoy.';
    }
    if (fechaNac.getFullYear() < 1905) {
      return 'Ingresa un año de nacimiento válido (posterior a 1905).';
    }

    const edad = calcularEdad(datos.fecha_nacimiento);
    if (datos.sexo === 'F' && datos.embarazada) {
      if (edad < 10 || edad > 60) {
        return 'Verifica la edad para poder registrar estado de embarazo.';
      }
      const sem = Number(datos.semanas_embarazo);
      if (!sem || sem < 1 || sem > 42) {
        return 'Las semanas de embarazo deben estar entre 1 y 42 semanas.';
      }
    }
    if (datos.tiene_patologia) {
      if (
        datos.detalle_patologia.trim().length < 3 ||
        datos.detalle_patologia.trim().length > LIMITES.PATOLOGIA
      ) {
        return `El detalle de patología debe tener entre 3 y ${LIMITES.PATOLOGIA} caracteres.`;
      }
    }
    if (datos.recibe_beneficio) {
      const textoBen = construirTextoBeneficios(
        datos.beneficios_seleccionados,
        datos.otro_beneficio
      );
      if (!textoBen) {
        return 'Debes marcar al menos un beneficio (CLAP, Bonos de la Patria, Gas Comunal u otro).';
      }
    }
    return null;
  };

  const familiasFiltradas = familias.filter((f) => {
    if (!f.activo) return false;
    if (calleSeleccionada !== 'todas' && f.calle_id !== calleSeleccionada) return false;

    if (busquedaGlobal) {
      const textoFamilia = `${f.numero_casa} ${f.nombre_familia || ''} ${f.calles?.nombre || ''}`.toLowerCase();
      const coincideIntegrante = (f.habitantes || []).some((h) =>
        `${h.nombres} ${h.apellidos} ${h.cedula || ''}`
          .toLowerCase()
          .includes(busquedaGlobal.toLowerCase())
      );
      return textoFamilia.includes(busquedaGlobal.toLowerCase()) || coincideIntegrante;
    }
    return true;
  });

  const handleGuardarCalle = async (e) => {
    e.preventDefault();
    setErrorFormulario('');
    if (
      formCalle.nombre.trim().length < 3 ||
      formCalle.sector.trim().length < 3 ||
      formCalle.lider_calle.trim().length < 3
    ) {
      setErrorFormulario('Cada campo de la calle debe tener al menos 3 caracteres.');
      return;
    }
    try {
      await crearCalle({
        nombre: formCalle.nombre.trim().slice(0, LIMITES.NOMBRE_CALLE),
        sector: formCalle.sector.trim().slice(0, LIMITES.SECTOR),
        lider_calle: formCalle.lider_calle.trim().slice(0, LIMITES.LIDER),
      });
      setFormCalle({ nombre: '', sector: '', lider_calle: '' });
      setModalCalle(false);
      recargarDatos();
    } catch (err) {
      setErrorFormulario(err.message);
    }
  };

  const handleGuardarFamiliaYJefe = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formFamilia.calle_id || !formFamilia.numero_casa.trim()) {
      setErrorFormulario('Selecciona la calle e ingresa el número de casa.');
      return;
    }
    if (calcularEdad(formFamilia.fecha_nacimiento) < 15) {
      setErrorFormulario('El Jefe(a) de Casa debe tener al menos 15 años de edad.');
      return;
    }

    const errorValidacion = validarDatosPersona(formFamilia, true);
    if (errorValidacion) {
      setErrorFormulario(errorValidacion);
      return;
    }

    try {
      const detalleBeneficioFinal = formFamilia.recibe_beneficio
        ? construirTextoBeneficios(
            formFamilia.beneficios_seleccionados,
            formFamilia.otro_beneficio
          )
        : null;

      const datosFamilia = {
        calle_id: formFamilia.calle_id,
        numero_casa: formFamilia.numero_casa.trim().slice(0, LIMITES.NUMERO_CASA),
        nombre_familia: (
          formFamilia.nombre_familia.trim() || `Familia ${formFamilia.apellidos.trim()}`
        ).slice(0, LIMITES.NOMBRE_FAMILIA),
      };

      const datosJefe = {
        cedula: formFamilia.cedula.trim(),
        nombres: formFamilia.nombres.trim(),
        apellidos: formFamilia.apellidos.trim(),
        fecha_nacimiento: formFamilia.fecha_nacimiento,
        sexo: formFamilia.sexo,
        telefono: formFamilia.telefono.trim(),
        embarazada: formFamilia.sexo === 'F' ? formFamilia.embarazada : false,
        semanas_embarazo:
          formFamilia.sexo === 'F' && formFamilia.embarazada
            ? Number(formFamilia.semanas_embarazo)
            : null,
        tiene_patologia: formFamilia.tiene_patologia,
        detalle_patologia: formFamilia.tiene_patologia
          ? formFamilia.detalle_patologia.trim().slice(0, LIMITES.PATOLOGIA)
          : null,
        recibe_beneficio: formFamilia.recibe_beneficio,
        detalle_beneficio: detalleBeneficioFinal,
      };

      await registrarFamiliaYJefe(datosFamilia, datosJefe);
      setModalNuevaFamilia(false);
      setFormFamilia(estadoInicialFamilia);
      recargarDatos();
    } catch (err) {
      setErrorFormulario(err.message);
    }
  };

  const handleGuardarIntegrante = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    const edadCalculada = calcularEdad(formPersona.fecha_nacimiento);
    const exigirCedula = edadCalculada >= 10;
    const errorValidacion = validarDatosPersona(formPersona, exigirCedula);
    if (errorValidacion) {
      setErrorFormulario(errorValidacion);
      return;
    }

    try {
      const detalleBeneficioFinal = formPersona.recibe_beneficio
        ? construirTextoBeneficios(
            formPersona.beneficios_seleccionados,
            formPersona.otro_beneficio
          )
        : null;

      await agregarIntegrante(
        {
          cedula: formPersona.cedula.trim() || null,
          nombres: formPersona.nombres.trim(),
          apellidos: formPersona.apellidos.trim(),
          fecha_nacimiento: formPersona.fecha_nacimiento,
          sexo: formPersona.sexo,
          telefono: formPersona.telefono.trim(),
          parentesco: formPersona.parentesco,
          familia_id: modalIntegrante,
          es_jefe_familia: formPersona.parentesco === 'Jefe de Casa',
          embarazada: formPersona.sexo === 'F' ? formPersona.embarazada : false,
          semanas_embarazo:
            formPersona.sexo === 'F' && formPersona.embarazada
              ? Number(formPersona.semanas_embarazo)
              : null,
          tiene_patologia: formPersona.tiene_patologia,
          detalle_patologia: formPersona.tiene_patologia
            ? formPersona.detalle_patologia.trim().slice(0, LIMITES.PATOLOGIA)
            : null,
          recibe_beneficio: formPersona.recibe_beneficio,
          detalle_beneficio: detalleBeneficioFinal,
        },
        true,
        'Ingreso registrado en ficha familiar'
      );
      setFamiliaExpandida(modalIntegrante);
      setModalIntegrante(null);
      setFormPersona(estadoInicialPersona);
      recargarDatos();
    } catch (err) {
      setErrorFormulario(err.message);
    }
  };

  const handleActualizarPersona = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    const edadCalculada = calcularEdad(formPersona.fecha_nacimiento);
    const errorValidacion = validarDatosPersona(formPersona, edadCalculada >= 10);
    if (errorValidacion) {
      setErrorFormulario(errorValidacion);
      return;
    }

    try {
      const detalleBeneficioFinal = formPersona.recibe_beneficio
        ? construirTextoBeneficios(
            formPersona.beneficios_seleccionados,
            formPersona.otro_beneficio
          )
        : null;

      await actualizarHabitante(modalEditarPersona.id, {
        cedula: formPersona.cedula.trim() || null,
        nombres: formPersona.nombres.trim(),
        apellidos: formPersona.apellidos.trim(),
        fecha_nacimiento: formPersona.fecha_nacimiento,
        sexo: formPersona.sexo,
        telefono: formPersona.telefono.trim(),
        parentesco: formPersona.parentesco,
        es_jefe_familia: formPersona.parentesco === 'Jefe de Casa',
        embarazada: formPersona.sexo === 'F' ? formPersona.embarazada : false,
        semanas_embarazo:
          formPersona.sexo === 'F' && formPersona.embarazada
            ? Number(formPersona.semanas_embarazo)
            : null,
        tiene_patologia: formPersona.tiene_patologia,
        detalle_patologia: formPersona.tiene_patologia
          ? formPersona.detalle_patologia.trim().slice(0, LIMITES.PATOLOGIA)
          : null,
        recibe_beneficio: formPersona.recibe_beneficio,
        detalle_beneficio: detalleBeneficioFinal,
      });
      setModalEditarPersona(null);
      recargarDatos();
    } catch (err) {
      setErrorFormulario(err.message);
    }
  };

  const handleEliminarIntegrante = async (persona) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar a ${persona.nombres} ${persona.apellidos} de esta familia?`
      )
    ) {
      await eliminarHabitante(persona.id);
      recargarDatos();
    }
  };

  const handleEliminarFamilia = async (familia) => {
    if (
      window.confirm(
        `⚠️ ¿Estás seguro de ELIMINAR LA FAMILIA COMPLETA de la Casa #${familia.numero_casa}? Se borrarán también todos sus integrantes registrados.`
      )
    ) {
      await eliminarFamiliaCompleta(familia.id);
      recargarDatos();
    }
  };

  const abrirModalEditar = (persona) => {
    setErrorFormulario('');
    const partes = (persona.detalle_beneficio || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const seleccionados = partes.filter((p) => OPCIONES_BENEFICIOS.includes(p));
    const otros = partes.filter((p) => !OPCIONES_BENEFICIOS.includes(p)).join(', ');

    setFormPersona({
      cedula: persona.cedula || '',
      nombres: persona.nombres || '',
      apellidos: persona.apellidos || '',
      fecha_nacimiento: persona.fecha_nacimiento || '',
      sexo: persona.sexo || 'F',
      telefono: persona.telefono || '',
      parentesco: persona.parentesco || 'Integrante',
      embarazada: persona.embarazada || false,
      semanas_embarazo: persona.semanas_embarazo ? String(persona.semanas_embarazo) : '',
      tiene_patologia: persona.tiene_patologia || false,
      detalle_patologia: persona.detalle_patologia || '',
      recibe_beneficio: persona.recibe_beneficio || false,
      beneficios_seleccionados: seleccionados.length > 0 ? seleccionados : ['CLAP'],
      otro_beneficio: otros,
    });
    setModalEditarPersona(persona);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E8EEF7] p-6 rounded-3xl border-2 border-indigo-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-indigo-950">
            Calles y Perfiles de Jefes de Casa (CRUD Familiar)
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-0.5">
            Gestiona viviendas, Jefes de Hogar y carga familiar con validación estricta.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setErrorFormulario('');
              setModalCalle(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#DCE4F2] border-2 border-indigo-300 hover:bg-indigo-200 text-indigo-950 text-sm font-extrabold shadow-sm cursor-pointer"
          >
            <MapPin size={17} className="text-indigo-700" />
            <span>Nueva Calle</span>
          </button>
          <button
            onClick={() => {
              setErrorFormulario('');
              setFormFamilia({
                ...estadoInicialFamilia,
                calle_id: calles[0]?.id || '',
              });
              setModalNuevaFamilia(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-extrabold shadow-lg shadow-indigo-700/30 cursor-pointer"
          >
            <Plus size={18} />
            <span>Registrar Jefe de Casa</span>
          </button>
        </div>
      </div>

      {/* Selector de Calles */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
        <button
          onClick={() => setCalleSeleccionada('todas')}
          className={`px-4 py-2.5 rounded-2xl text-sm font-extrabold whitespace-nowrap transition cursor-pointer ${
            calleSeleccionada === 'todas'
              ? 'bg-indigo-800 text-white shadow-md'
              : 'bg-[#E8EEF7] border-2 border-indigo-200 text-slate-700 hover:bg-indigo-100'
          }`}
        >
          Todas las Calles ({familias.filter((f) => f.activo).length} casas)
        </button>
        {calles.map((c) => (
          <button
            key={c.id}
            onClick={() => setCalleSeleccionada(c.id)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-extrabold whitespace-nowrap transition cursor-pointer ${
              calleSeleccionada === c.id
                ? 'bg-indigo-800 text-white shadow-md'
                : 'bg-[#E8EEF7] border-2 border-indigo-200 text-slate-700 hover:bg-indigo-100'
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Lista de Jefes de Casa y sus Familias */}
      <div className="space-y-5">
        {familiasFiltradas.map((familia) => {
          const habitantesActivos = (familia.habitantes || []).filter(
            (h) => h.estado === 'activo'
          );
          const jefe =
            habitantesActivos.find((h) => h.es_jefe_familia) || habitantesActivos[0];
          const expandida = familiaExpandida === familia.id;

          return (
            <div
              key={familia.id}
              className="bg-[#E8EEF7] border-2 border-indigo-300 rounded-3xl overflow-hidden shadow-md"
            >
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-800 text-white flex items-center justify-center shadow-md shrink-0">
                    <Home size={26} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-indigo-900 text-white">
                        {familia.calles?.nombre} • Casa #{familia.numero_casa}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-200 text-indigo-950">
                        {habitantesActivos.length} integrantes en casa
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mt-1.5">
                      Jefe(a) de Casa:{' '}
                      {jefe
                        ? `${jefe.nombres} ${jefe.apellidos}`
                        : familia.nombre_familia}
                    </h3>

                    {jefe && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 mt-1.5 font-bold">
                        <span className="bg-[#DCE4F2] px-2.5 py-1 rounded-md border border-indigo-200">
                          C.I: {jefe.cedula || 'S/C'}
                        </span>
                        <span className="bg-[#DCE4F2] px-2.5 py-1 rounded-md border border-indigo-200">
                          Edad: {calcularEdad(jefe.fecha_nacimiento)} años
                        </span>
                        {jefe.telefono && (
                          <span className="flex items-center gap-1 bg-[#DCE4F2] px-2.5 py-1 rounded-md border border-indigo-200">
                            <Phone size={12} /> {jefe.telefono}
                          </span>
                        )}
                        {jefe.tiene_patologia && (
                          <span className="bg-rose-600 text-white px-2.5 py-1 rounded-md font-extrabold">
                            Patología: {jefe.detalle_patologia}
                          </span>
                        )}
                        {jefe.recibe_beneficio && (
                          <span className="bg-emerald-700 text-white px-2.5 py-1 rounded-md font-extrabold">
                            Beneficios: {jefe.detalle_beneficio}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones grandes y visibles */}
                <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                  <button
                    onClick={() => {
                      setErrorFormulario('');
                      setFormPersona(estadoInicialPersona);
                      setModalIntegrante(familia.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>+ Agregar Familiar</span>
                  </button>

                  <button
                    onClick={() =>
                      setFamiliaExpandida(expandida ? null : familia.id)
                    }
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-extrabold shadow cursor-pointer"
                  >
                    <span>
                      {expandida
                        ? 'Ocultar Carga Familiar'
                        : `Ver Familia (${habitantesActivos.length})`}
                    </span>
                    {expandida ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <button
                    onClick={() => handleEliminarFamilia(familia)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Eliminar Familia</span>
                  </button>
                </div>
              </div>

              {/* TABLA CRUD DE LA FAMILIA MUY VISIBLE Y CONTRASTADA */}
              {expandida && (
                <div className="border-t-2 border-indigo-300 bg-[#D5DFEE] p-5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-3">
                    Núcleo Familiar Registrado en Casa #{familia.numero_casa}
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border-2 border-indigo-300 shadow">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-indigo-950 text-white text-xs uppercase">
                          <th className="py-3 px-4 font-extrabold">Nombre Completo</th>
                          <th className="py-3 px-4 font-extrabold">Cédula</th>
                          <th className="py-3 px-4 font-extrabold">Parentesco</th>
                          <th className="py-3 px-4 font-extrabold">Edad / Sexo</th>
                          <th className="py-3 px-4 font-extrabold">Salud / Embarazo</th>
                          <th className="py-3 px-4 font-extrabold">Beneficios</th>
                          <th className="py-3 px-4 font-extrabold text-right">
                            Acciones CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-indigo-200">
                        {habitantesActivos.map((integrante, i) => (
                          <tr
                            key={integrante.id}
                            className={
                              i % 2 === 0
                                ? 'bg-[#E8EEF7] hover:bg-indigo-100'
                                : 'bg-[#DCE4F2] hover:bg-indigo-100'
                            }
                          >
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              {integrante.nombres} {integrante.apellidos}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {integrante.cedula || 'Sin C.I.'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-extrabold ${
                                  integrante.es_jefe_familia
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-indigo-200 text-indigo-950'
                                }`}
                              >
                                {integrante.parentesco}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {calcularEdad(integrante.fecha_nacimiento)} años (
                              {integrante.sexo})
                            </td>
                            <td className="py-3.5 px-4">
                              {integrante.embarazada && (
                                <span className="px-2.5 py-1 rounded-md bg-pink-600 text-white font-extrabold text-xs inline-block mr-1">
                                  Embarazada ({integrante.semanas_embarazo || '?'} sem)
                                </span>
                              )}
                              {integrante.tiene_patologia ? (
                                <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-extrabold text-xs inline-block">
                                  {integrante.detalle_patologia}
                                </span>
                              ) : (
                                !integrante.embarazada && (
                                  <span className="text-slate-600 font-bold text-xs">
                                    Sano
                                  </span>
                                )
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {integrante.recibe_beneficio ? (
                                <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-extrabold text-xs inline-block">
                                  {integrante.detalle_beneficio}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-bold text-xs">
                                  Ninguno
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => abrirModalEditar(integrante)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-xs font-extrabold text-white shadow-sm cursor-pointer"
                                >
                                  <Edit3 size={13} /> Editar
                                </button>
                                <button
                                  onClick={() => handleEliminarIntegrante(integrante)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-extrabold text-white shadow-sm cursor-pointer"
                                >
                                  <Trash2 size={13} /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Nueva Calle (Con límites de caracteres y fondo no blanco) */}
      {modalCalle && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleGuardarCalle}
            className="bg-[#E8EEF7] rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl border-2 border-indigo-300"
          >
            <h3 className="text-xl font-black text-indigo-950">
              Registrar Nueva Calle en la Comunidad
            </h3>
            {errorFormulario && (
              <div className="p-4 bg-rose-100 border-2 border-rose-400 text-rose-800 rounded-2xl text-sm font-extrabold flex items-center gap-2">
                <AlertCircle size={18} /> {errorFormulario}
              </div>
            )}
            <div>
              <div className="flex justify-between text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                <span>Nombre de la Calle *</span>
                <span>
                  {formCalle.nombre.length}/{LIMITES.NOMBRE_CALLE}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={LIMITES.NOMBRE_CALLE}
                placeholder="Ej: Calle Libertador"
                value={formCalle.nombre}
                onChange={(e) =>
                  setFormCalle({
                    ...formCalle,
                    nombre: textoSeguro(e.target.value, LIMITES.NOMBRE_CALLE),
                  })
                }
                className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-2xl px-4 py-3 text-base font-bold text-slate-900"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                <span>Sector *</span>
                <span>
                  {formCalle.sector.length}/{LIMITES.SECTOR}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={LIMITES.SECTOR}
                placeholder="Ej: Sector Centro"
                value={formCalle.sector}
                onChange={(e) =>
                  setFormCalle({
                    ...formCalle,
                    sector: textoSeguro(e.target.value, LIMITES.SECTOR),
                  })
                }
                className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-2xl px-4 py-3 text-base font-bold text-slate-900"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                <span>Líder de Calle (Solo Letras) *</span>
                <span>
                  {formCalle.lider_calle.length}/{LIMITES.LIDER}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={LIMITES.LIDER}
                placeholder="Ej: María Rodríguez"
                value={formCalle.lider_calle}
                onChange={(e) =>
                  setFormCalle({
                    ...formCalle,
                    lider_calle: soloLetras(e.target.value, LIMITES.LIDER),
                  })
                }
                className="w-full bg-[#DCE4F2] border-2 border-indigo-300 rounded-2xl px-4 py-3 text-base font-bold text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalCalle(false)}
                className="px-5 py-3 rounded-2xl bg-slate-300 text-slate-800 text-sm font-extrabold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-indigo-700 text-white text-sm font-extrabold cursor-pointer"
              >
                Guardar Calle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Registrar Jefe de Casa (Con contadores y validación al milímetro) */}
      {modalNuevaFamilia && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleGuardarFamiliaYJefe}
            className="bg-[#E8EEF7] rounded-[32px] p-8 w-full max-w-4xl space-y-6 my-8 shadow-2xl border-2 border-indigo-300 max-h-[92vh] overflow-y-auto"
          >
            <div className="border-b-2 border-indigo-200 pb-4">
              <h3 className="text-2xl font-black text-indigo-950">
                Registro de Vivienda y Perfil del Jefe de Casa
              </h3>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Todos los campos tienen límite de caracteres, validación de formato y bloqueo de cédulas repetidas.
              </p>
            </div>

            {errorFormulario && (
              <div className="p-4 bg-rose-100 border-2 border-rose-400 text-rose-800 rounded-2xl text-sm font-extrabold flex items-center gap-2.5">
                <AlertCircle size={20} className="shrink-0" />
                <span>{errorFormulario}</span>
              </div>
            )}

            {/* Sección 1: Ubicación */}
            <div className="bg-[#DCE4F2] p-5 rounded-2xl border-2 border-indigo-200 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                1. Ubicación de la Vivienda
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Calle de la Comunidad *
                  </label>
                  <select
                    required
                    value={formFamilia.calle_id}
                    onChange={(e) =>
                      setFormFamilia({ ...formFamilia, calle_id: e.target.value })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  >
                    <option value="">Seleccionar Calle...</option>
                    {calles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Nº de Casa *</span>
                    <span>
                      {formFamilia.numero_casa.length}/{LIMITES.NUMERO_CASA}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.NUMERO_CASA}
                    placeholder="Ej: 14-B"
                    value={formFamilia.numero_casa}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        numero_casa: textoSeguro(e.target.value, LIMITES.NUMERO_CASA),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Nombre Familia (Solo Letras) *</span>
                    <span>
                      {formFamilia.nombre_familia.length}/{LIMITES.NOMBRE_FAMILIA}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.NOMBRE_FAMILIA}
                    placeholder="Ej: Familia Medina"
                    value={formFamilia.nombre_familia}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        nombre_familia: soloLetras(
                          e.target.value,
                          LIMITES.NOMBRE_FAMILIA
                        ),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Datos Personales */}
            <div className="bg-[#DCE4F2] p-5 rounded-2xl border-2 border-indigo-200 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                2. Datos Personales del Jefe(a) de Casa
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Cédula (Solo Números) *</span>
                    <span>
                      {formFamilia.cedula.length}/{LIMITES.CEDULA}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={LIMITES.CEDULA}
                    placeholder="Ej: 28738700"
                    value={formFamilia.cedula}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        cedula: soloNumeros(e.target.value, LIMITES.CEDULA),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-extrabold"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Nombres (Solo Letras) *</span>
                    <span>
                      {formFamilia.nombres.length}/{LIMITES.NOMBRES}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.NOMBRES}
                    placeholder="Ej: José Miguel"
                    value={formFamilia.nombres}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        nombres: soloLetras(e.target.value, LIMITES.NOMBRES),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Apellidos (Solo Letras) *</span>
                    <span>
                      {formFamilia.apellidos.length}/{LIMITES.APELLIDOS}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.APELLIDOS}
                    placeholder="Ej: Medina González"
                    value={formFamilia.apellidos}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        apellidos: soloLetras(e.target.value, LIMITES.APELLIDOS),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    min="1905-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    value={formFamilia.fecha_nacimiento}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Sexo *
                  </label>
                  <select
                    value={formFamilia.sexo}
                    onChange={(e) =>
                      setFormFamilia({ ...formFamilia, sexo: e.target.value })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  >
                    <option value="F">Femenino (F)</option>
                    <option value="M">Masculino (M)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Teléfono (11 Dígitos) *</span>
                    <span>
                      {formFamilia.telefono.length}/{LIMITES.TELEFONO}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={LIMITES.TELEFONO}
                    placeholder="Ej: 04121234567"
                    value={formFamilia.telefono}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        telefono: soloNumeros(e.target.value, LIMITES.TELEFONO),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-extrabold"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Salud y Beneficios */}
            <div className="bg-[#DCE4F2] p-5 rounded-2xl border-2 border-indigo-200 space-y-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                3. Condiciones de Salud y Beneficios Sociales
              </h4>

              {formFamilia.sexo === 'F' && (
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={formFamilia.embarazada}
                      onChange={(e) =>
                        setFormFamilia({
                          ...formFamilia,
                          embarazada: e.target.checked,
                        })
                      }
                    />
                    <span>¿Está embarazada actualmente?</span>
                  </label>
                  {formFamilia.embarazada && (
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={LIMITES.SEMANAS}
                      required
                      placeholder="Semanas (1 a 42)"
                      value={formFamilia.semanas_embarazo}
                      onChange={(e) =>
                        setFormFamilia({
                          ...formFamilia,
                          semanas_embarazo: soloNumeros(
                            e.target.value,
                            LIMITES.SEMANAS
                          ),
                        })
                      }
                      className="bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-base w-48 font-extrabold"
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={formFamilia.tiene_patologia}
                      onChange={(e) =>
                        setFormFamilia({
                          ...formFamilia,
                          tiene_patologia: e.target.checked,
                        })
                      }
                    />
                    <span>¿Presenta alguna patología médica?</span>
                  </label>
                  {formFamilia.tiene_patologia && (
                    <span className="text-xs font-extrabold text-indigo-900">
                      {formFamilia.detalle_patologia.length}/{LIMITES.PATOLOGIA}
                    </span>
                  )}
                </div>
                {formFamilia.tiene_patologia && (
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.PATOLOGIA}
                    placeholder="Especifique las patologías (Máx. 100 caracteres)"
                    value={formFamilia.detalle_patologia}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        detalle_patologia: textoSeguro(
                          e.target.value,
                          LIMITES.PATOLOGIA
                        ),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                )}
              </div>

              <div className="space-y-3 pt-2 border-t-2 border-indigo-200">
                <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={formFamilia.recibe_beneficio}
                    onChange={(e) =>
                      setFormFamilia({
                        ...formFamilia,
                        recibe_beneficio: e.target.checked,
                      })
                    }
                  />
                  <span>¿Recibe Beneficios de la Comunidad / Estado?</span>
                </label>

                {formFamilia.recibe_beneficio && (
                  <div className="space-y-3 pl-1">
                    <p className="text-xs font-extrabold text-slate-700">
                      Marca los beneficios asignados:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {OPCIONES_BENEFICIOS.map((op) => {
                        const marcado =
                          formFamilia.beneficios_seleccionados.includes(op);
                        return (
                          <button
                            type="button"
                            key={op}
                            onClick={() => toggleBeneficio(op, true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold border-2 transition cursor-pointer ${
                              marcado
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                                : 'bg-[#E8EEF7] text-slate-800 border-indigo-300 hover:bg-indigo-100'
                            }`}
                          >
                            {marcado && <Check size={16} />}
                            <span>{op}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1">
                        <span>Otro beneficio adicional (Opcional)</span>
                        <span>
                          {formFamilia.otro_beneficio.length}/{LIMITES.OTRO_BENEFICIO}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={LIMITES.OTRO_BENEFICIO}
                        placeholder="Ej: Amor Mayor, Hogares de la Patria"
                        value={formFamilia.otro_beneficio}
                        onChange={(e) =>
                          setFormFamilia({
                            ...formFamilia,
                            otro_beneficio: textoSeguro(
                              e.target.value,
                              LIMITES.OTRO_BENEFICIO
                            ),
                          })
                        }
                        className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalNuevaFamilia(false)}
                className="px-6 py-3.5 rounded-2xl bg-slate-300 hover:bg-slate-400 text-slate-900 text-base font-extrabold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-base font-extrabold shadow-lg cursor-pointer"
              >
                Guardar Vivienda y Jefe de Casa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Agregar o Editar Integrante (Con límite de caracteres y validación total) */}
      {(modalIntegrante || modalEditarPersona) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={
              modalEditarPersona ? handleActualizarPersona : handleGuardarIntegrante
            }
            className="bg-[#E8EEF7] rounded-[32px] p-8 w-full max-w-4xl space-y-6 my-8 shadow-2xl border-2 border-indigo-300 max-h-[92vh] overflow-y-auto"
          >
            <div className="border-b-2 border-indigo-200 pb-4">
              <h3 className="text-2xl font-black text-indigo-950">
                {modalEditarPersona
                  ? `Actualizar Datos de ${modalEditarPersona.nombres} ${modalEditarPersona.apellidos}`
                  : 'Registrar Nuevo Integrante en la Familia'}
              </h3>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Todos los campos cuentan con límite máximo de caracteres y validación estricta.
              </p>
            </div>

            {errorFormulario && (
              <div className="p-4 bg-rose-100 border-2 border-rose-400 text-rose-800 rounded-2xl text-sm font-extrabold flex items-center gap-2.5">
                <AlertCircle size={20} className="shrink-0" />
                <span>{errorFormulario}</span>
              </div>
            )}

            <div className="bg-[#DCE4F2] p-5 rounded-2xl border-2 border-indigo-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Cédula (Solo Números)</span>
                    <span>
                      {formPersona.cedula.length}/{LIMITES.CEDULA}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={LIMITES.CEDULA}
                    placeholder="Opcional en menores de 10 años"
                    value={formPersona.cedula}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        cedula: soloNumeros(e.target.value, LIMITES.CEDULA),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-extrabold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Parentesco con el Jefe(a) *
                  </label>
                  <select
                    value={formPersona.parentesco}
                    onChange={(e) =>
                      setFormPersona({ ...formPersona, parentesco: e.target.value })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  >
                    <option value="Jefe de Casa">Jefe de Casa</option>
                    <option value="Esposo(a) / Pareja">Esposo(a) / Pareja</option>
                    <option value="Hijo(a)">Hijo(a)</option>
                    <option value="Nieto(a)">Nieto(a)</option>
                    <option value="Madre / Padre">Madre / Padre</option>
                    <option value="Hermano(a)">Hermano(a)</option>
                    <option value="Otro Familiar">Otro Familiar</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Teléfono (11 Dígitos)</span>
                    <span>
                      {formPersona.telefono.length}/{LIMITES.TELEFONO}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={LIMITES.TELEFONO}
                    placeholder="Ej: 04141234567"
                    value={formPersona.telefono}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        telefono: soloNumeros(e.target.value, LIMITES.TELEFONO),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Nombres *</span>
                    <span>
                      {formPersona.nombres.length}/{LIMITES.NOMBRES}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.NOMBRES}
                    placeholder="Solo letras"
                    value={formPersona.nombres}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        nombres: soloLetras(e.target.value, LIMITES.NOMBRES),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                    <span>Apellidos *</span>
                    <span>
                      {formPersona.apellidos.length}/{LIMITES.APELLIDOS}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.APELLIDOS}
                    placeholder="Solo letras"
                    value={formPersona.apellidos}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        apellidos: soloLetras(e.target.value, LIMITES.APELLIDOS),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    min="1905-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    value={formPersona.fecha_nacimiento}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Sexo *
                  </label>
                  <select
                    value={formPersona.sexo}
                    onChange={(e) =>
                      setFormPersona({ ...formPersona, sexo: e.target.value })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  >
                    <option value="F">Femenino (F)</option>
                    <option value="M">Masculino (M)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Salud y Beneficios del Integrante */}
            <div className="bg-[#DCE4F2] p-5 rounded-2xl border-2 border-indigo-200 space-y-5">
              {formPersona.sexo === 'F' && (
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={formPersona.embarazada}
                      onChange={(e) =>
                        setFormPersona({
                          ...formPersona,
                          embarazada: e.target.checked,
                        })
                      }
                    />
                    <span>¿Está embarazada?</span>
                  </label>
                  {formPersona.embarazada && (
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={LIMITES.SEMANAS}
                      required
                      placeholder="Semanas (1 a 42)"
                      value={formPersona.semanas_embarazo}
                      onChange={(e) =>
                        setFormPersona({
                          ...formPersona,
                          semanas_embarazo: soloNumeros(
                            e.target.value,
                            LIMITES.SEMANAS
                          ),
                        })
                      }
                      className="bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-base w-48 font-extrabold"
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={formPersona.tiene_patologia}
                      onChange={(e) =>
                        setFormPersona({
                          ...formPersona,
                          tiene_patologia: e.target.checked,
                        })
                      }
                    />
                    <span>¿Tiene alguna Patología Médica?</span>
                  </label>
                  {formPersona.tiene_patologia && (
                    <span className="text-xs font-extrabold text-indigo-900">
                      {formPersona.detalle_patologia.length}/{LIMITES.PATOLOGIA}
                    </span>
                  )}
                </div>
                {formPersona.tiene_patologia && (
                  <input
                    type="text"
                    required
                    maxLength={LIMITES.PATOLOGIA}
                    placeholder="Detalle la patología médica (Máx. 100 caracteres)"
                    value={formPersona.detalle_patologia}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        detalle_patologia: textoSeguro(
                          e.target.value,
                          LIMITES.PATOLOGIA
                        ),
                      })
                    }
                    className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-3 text-base font-bold"
                  />
                )}
              </div>

              <div className="space-y-3 pt-2 border-t-2 border-indigo-200">
                <label className="flex items-center gap-2.5 text-base font-extrabold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={formPersona.recibe_beneficio}
                    onChange={(e) =>
                      setFormPersona({
                        ...formPersona,
                        recibe_beneficio: e.target.checked,
                      })
                    }
                  />
                  <span>¿Recibe Beneficios Sociales?</span>
                </label>

                {formPersona.recibe_beneficio && (
                  <div className="space-y-3 pl-1">
                    <p className="text-xs font-extrabold text-slate-700">
                      Selecciona los beneficios (CLAP, Bonos de la Patria, Gas Comunal):
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {OPCIONES_BENEFICIOS.map((op) => {
                        const marcado =
                          formPersona.beneficios_seleccionados.includes(op);
                        return (
                          <button
                            type="button"
                            key={op}
                            onClick={() => toggleBeneficio(op, false)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold border-2 transition cursor-pointer ${
                              marcado
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                                : 'bg-[#E8EEF7] text-slate-800 border-indigo-300 hover:bg-indigo-100'
                            }`}
                          >
                            {marcado && <Check size={16} />}
                            <span>{op}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 mb-1">
                        <span>Otro beneficio adicional (Opcional)</span>
                        <span>
                          {formPersona.otro_beneficio.length}/{LIMITES.OTRO_BENEFICIO}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={LIMITES.OTRO_BENEFICIO}
                        placeholder="Otro beneficio adicional"
                        value={formPersona.otro_beneficio}
                        onChange={(e) =>
                          setFormPersona({
                            ...formPersona,
                            otro_beneficio: textoSeguro(
                              e.target.value,
                              LIMITES.OTRO_BENEFICIO
                            ),
                          })
                        }
                        className="w-full bg-[#E8EEF7] border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalIntegrante(null);
                  setModalEditarPersona(null);
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-300 hover:bg-slate-400 text-slate-900 text-base font-extrabold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-base font-extrabold shadow-lg cursor-pointer"
              >
                {modalEditarPersona ? 'Guardar Cambios' : 'Registrar Integrante'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}