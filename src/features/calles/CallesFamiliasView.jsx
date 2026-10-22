import { useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  UserPlus,
  Users,
  Home,
  Phone,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  HeartPulse,
} from 'lucide-react';
import {
  crearCalle,
  eliminarCalle,
  crearFamiliaConJefe,
  eliminarFamilia,
  agregarHabitante,
  actualizarHabitante,
  eliminarHabitante,
} from '../../services/censoService';
import { calcularEdad } from '../../utils/calculosDemograficos';
import {
  ModalNuevaCalle,
  ModalEliminarCalle,
} from '../../components/modales/ModalGestionCalle';
import {
  ModalFamilia,
  ModalHabitante,
} from '../../components/modales/ModalGestionFamilia';

const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const REGEX_SOLO_NUMEROS = /^[0-9]+$/;

export default function CallesFamiliasView({
  calles = [],
  familias = [],
  recargarDatos,
  busquedaGlobal = '',
}) {
  const [calleSeleccionada, setCalleSeleccionada] = useState('TODAS');
  const [busquedaLocal, setBusquedaLocal] = useState('');

  const [alertaVerde, setAlertaVerde] = useState('');
  const [alertaRoja, setAlertaRoja] = useState('');

  const [modalCalle, setModalCalle] = useState(false);
  const [nombreNuevaCalle, setNombreNuevaCalle] = useState('');
  const [sectorNuevaCalle, setSectorNuevaCalle] = useState('');
  const [calleAEliminar, setCalleAEliminar] = useState(null);

  const [modalFamilia, setModalFamilia] = useState(false);
  const [formFamilia, setFormFamilia] = useState({
    calle_id: '',
    numero_casa: '',
    nombre_familia: '',
    telefono_contacto: '',
    nombres_jefe: '',
    apellidos_jefe: '',
    cedula_jefe: '',
    fecha_nacimiento_jefe: '',
    sexo_jefe: 'F',
    condicion_salud_jefe: 'Sano',
    beneficios_jefe: [],
  });

  const [modalHabitante, setModalHabitante] = useState(false);
  const [familiaActivaId, setFamiliaActivaId] = useState(null);
  const [habitanteEditandoId, setHabitanteEditandoId] = useState(null);
  const [formHabitante, setFormHabitante] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha_nacimiento: '',
    sexo: 'F',
    parentesco: 'Hijo',
    es_jefe_familia: false,
    condicion_salud: 'Sano',
    beneficios: [],
  });

  const [procesando, setProcesando] = useState(false);

  const mostrarExito = (mensaje) => {
    setAlertaRoja('');
    setAlertaVerde(mensaje);
  };

  const mostrarError = (mensaje) => {
    setAlertaVerde('');
    setAlertaRoja(mensaje);
  };

  const textoFiltro = (busquedaLocal || busquedaGlobal).trim().toLowerCase();

  const familiasFiltradas = familias.filter((fam) => {
    if (
      calleSeleccionada !== 'TODAS' &&
      String(fam.calle_id) !== String(calleSeleccionada)
    ) {
      return false;
    }
    if (!textoFiltro) return true;

    const calleNombre = (fam.calles?.nombre || '').toLowerCase();
    const casa = (fam.numero_casa || '').toLowerCase();
    const apellidoFam = (fam.nombre_familia || '').toLowerCase();
    const coincideIntegrante = (fam.habitantes || []).some((h) => {
      const nombre = `${h.nombres || ''} ${h.apellidos || ''}`.toLowerCase();
      const cedula = (h.cedula || '').toLowerCase();
      return nombre.includes(textoFiltro) || cedula.includes(textoFiltro);
    });

    return (
      calleNombre.includes(textoFiltro) ||
      casa.includes(textoFiltro) ||
      apellidoFam.includes(textoFiltro) ||
      coincideIntegrante
    );
  });

  // 1. CREAR CALLE CON VALIDACIÓN ESTRICTA
  const handleCrearCalle = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombreNuevaCalle.trim();
    const sectorLimpio = sectorNuevaCalle.trim();

    if (!nombreLimpio || nombreLimpio.length > 28 || !REGEX_SOLO_LETRAS.test(nombreLimpio)) {
      mostrarError('El nombre de la calle solo debe contener letras y máximo 28 caracteres.');
      return;
    }

    setProcesando(true);
    try {
      await crearCalle({
        nombre: nombreLimpio,
        sector: sectorLimpio || 'Sector Principal',
      });
      setNombreNuevaCalle('');
      setSectorNuevaCalle('');
      setModalCalle(false);
      await recargarDatos();
      mostrarExito(`¡La calle "${nombreLimpio}" fue agregada con éxito!`);
    } catch (err) {
      if (err.message && err.message.includes('calles_nombre_key')) {
        mostrarError(`La calle "${nombreLimpio}" ya se encuentra registrada.`);
      } else {
        mostrarError(err.message || 'No se pudo agregar la calle.');
      }
    } finally {
      setProcesando(false);
    }
  };

  // 2. ELIMINAR CALLE
  const handleConfirmarEliminarCalle = async () => {
    if (!calleAEliminar) return;
    setProcesando(true);
    try {
      const nombreBorrado = calleAEliminar.nombre;
      await eliminarCalle(calleAEliminar.id);
      if (String(calleSeleccionada) === String(calleAEliminar.id)) {
        setCalleSeleccionada('TODAS');
      }
      setCalleAEliminar(null);
      await recargarDatos();
      mostrarExito(`¡La calle "${nombreBorrado}" fue eliminada correctamente!`);
    } catch (err) {
      mostrarError(err.message || 'No se pudo eliminar la calle.');
    } finally {
      setProcesando(false);
    }
  };

  // 3. CREAR FAMILIA Y JEFE DE CASA CON VALIDACIÓN ESTRICTA
  const handleCrearFamilia = async (e) => {
    e.preventDefault();
    const nombres = formFamilia.nombres_jefe.trim();
    const apellidos = formFamilia.apellidos_jefe.trim();
    const cedula = formFamilia.cedula_jefe.trim();
    const casa = formFamilia.numero_casa.trim();
    const telefono = formFamilia.telefono_contacto.trim();

    if (!formFamilia.calle_id) {
      mostrarError('Por favor selecciona la calle donde queda la vivienda.');
      return;
    }
    if (!nombres || nombres.length > 28 || !REGEX_SOLO_LETRAS.test(nombres)) {
      mostrarError('Los nombres del Jefe de Casa solo deben tener letras (máximo 28 caracteres).');
      return;
    }
    if (!apellidos || apellidos.length > 28 || !REGEX_SOLO_LETRAS.test(apellidos)) {
      mostrarError('Los apellidos del Jefe de Casa solo deben tener letras (máximo 28 caracteres).');
      return;
    }
    if (!casa || !REGEX_SOLO_NUMEROS.test(casa)) {
      mostrarError('El número de casa solo debe contener números.');
      return;
    }
    if (!cedula || !REGEX_SOLO_NUMEROS.test(cedula)) {
      mostrarError('La cédula solo debe contener números.');
      return;
    }
    if (telefono && !REGEX_SOLO_NUMEROS.test(telefono)) {
      mostrarError('El teléfono solo debe contener números.');
      return;
    }

    setProcesando(true);
    try {
      await crearFamiliaConJefe(
        {
          calle_id: formFamilia.calle_id,
          numero_casa: casa,
          nombre_familia: `Familia ${apellidos}`.slice(0, 28),
          telefono_contacto: telefono,
        },
        {
          nombres,
          apellidos,
          cedula,
          fecha_nacimiento: formFamilia.fecha_nacimiento_jefe,
          sexo: formFamilia.sexo_jefe,
          parentesco: 'Jefe de Casa',
          es_jefe_familia: true,
          condicion_salud: formFamilia.condicion_salud_jefe.trim() || 'Sano',
          beneficios: formFamilia.beneficios_jefe,
        }
      );
      setModalFamilia(false);
      setFormFamilia({
        calle_id: '',
        numero_casa: '',
        nombre_familia: '',
        telefono_contacto: '',
        nombres_jefe: '',
        apellidos_jefe: '',
        cedula_jefe: '',
        fecha_nacimiento_jefe: '',
        sexo_jefe: 'F',
        condicion_salud_jefe: 'Sano',
        beneficios_jefe: [],
      });
      await recargarDatos();
      mostrarExito('¡Jefe de Casa y vivienda registrados con éxito!');
    } catch (err) {
      mostrarError(err.message || 'No se pudo registrar la familia.');
    } finally {
      setProcesando(false);
    }
  };

  // 4. ELIMINAR FAMILIA
  const handleEliminarFamilia = async (fam) => {
    if (!window.confirm(`¿Deseas eliminar la Casa ${fam.numero_casa} y sus integrantes?`)) return;
    setProcesando(true);
    try {
      await eliminarFamilia(fam.id);
      await recargarDatos();
      mostrarExito('¡Vivienda y registro familiar eliminados correctamente!');
    } catch (err) {
      mostrarError(err.message || 'No se pudo eliminar la familia.');
    } finally {
      setProcesando(false);
    }
  };

  // 5. AGREGAR O EDITAR INTEGRANTE CON VALIDACIÓN ESTRICTA
  const abrirModalNuevoFamiliar = (familiaId) => {
    setFamiliaActivaId(familiaId);
    setHabitanteEditandoId(null);
    setFormHabitante({
      nombres: '',
      apellidos: '',
      cedula: '',
      fecha_nacimiento: '',
      sexo: 'F',
      parentesco: 'Hijo',
      es_jefe_familia: false,
      condicion_salud: 'Sano',
      beneficios: [],
    });
    setModalHabitante(true);
  };

  const abrirModalEditarHabitante = (hab, familiaId) => {
    setFamiliaActivaId(familiaId);
    setHabitanteEditandoId(hab.id);
    setFormHabitante({
      nombres: (hab.nombres || '').slice(0, 28),
      apellidos: (hab.apellidos || '').slice(0, 28),
      cedula: (hab.cedula || '').replace(/[^0-9]/g, ''),
      fecha_nacimiento: hab.fecha_nacimiento || '',
      sexo: hab.sexo || 'F',
      parentesco: (hab.parentesco || 'Familiar').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 28),
      es_jefe_familia: Boolean(hab.es_jefe_familia),
      condicion_salud: (hab.condicion_salud || 'Sano').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 28),
      beneficios: Array.isArray(hab.beneficios) ? hab.beneficios : [],
    });
    setModalHabitante(true);
  };

  const handleGuardarHabitante = async (e) => {
    e.preventDefault();
    const nombres = formHabitante.nombres.trim();
    const apellidos = formHabitante.apellidos.trim();
    const cedula = formHabitante.cedula.trim();

    if (!nombres || nombres.length > 28 || !REGEX_SOLO_LETRAS.test(nombres)) {
      mostrarError('Los nombres solo deben contener letras y máximo 28 caracteres.');
      return;
    }
    if (!apellidos || apellidos.length > 28 || !REGEX_SOLO_LETRAS.test(apellidos)) {
      mostrarError('Los apellidos solo deben contener letras y máximo 28 caracteres.');
      return;
    }
    if (cedula && !REGEX_SOLO_NUMEROS.test(cedula)) {
      mostrarError('La cédula solo debe contener números.');
      return;
    }

    setProcesando(true);
    try {
      const datosLimpios = {
        ...formHabitante,
        nombres,
        apellidos,
        cedula,
        parentesco: formHabitante.parentesco.trim() || 'Familiar',
        condicion_salud: formHabitante.condicion_salud.trim() || 'Sano',
      };

      if (habitanteEditandoId) {
        await actualizarHabitante(habitanteEditandoId, datosLimpios);
        mostrarExito(`¡Los datos de ${nombres} se actualizaron con éxito!`);
      } else {
        await agregarHabitante({
          ...datosLimpios,
          familia_id: familiaActivaId,
        });
        mostrarExito(`¡${nombres} fue agregado(a) con éxito!`);
      }
      setModalHabitante(false);
      await recargarDatos();
    } catch (err) {
      mostrarError(err.message || 'No se pudieron guardar los datos.');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarHabitante = async (hab) => {
    if (!window.confirm(`¿Deseas quitar a ${hab.nombres} ${hab.apellidos}?`)) return;
    setProcesando(true);
    try {
      await eliminarHabitante(hab.id);
      await recargarDatos();
      mostrarExito(`¡${hab.nombres} fue retirado(a) del registro!`);
    } catch (err) {
      mostrarError(err.message || 'No se pudo eliminar.');
    } finally {
      setProcesando(false);
    }
  };

  const toggleBeneficio = (beneficio, esJefe = false) => {
    if (esJefe) {
      const actual = formFamilia.beneficios_jefe;
      const nuevo = actual.includes(beneficio)
        ? actual.filter((b) => b !== beneficio)
        : [...actual, beneficio];
      setFormFamilia({ ...formFamilia, beneficios_jefe: nuevo });
    } else {
      const actual = formHabitante.beneficios;
      const nuevo = actual.includes(beneficio)
        ? actual.filter((b) => b !== beneficio)
        : [...actual, beneficio];
      setFormHabitante({ ...formHabitante, beneficios: nuevo });
    }
  };

  return (
    <div className="space-y-6">
      {alertaVerde && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-black">¡Operación realizada con éxito!</p>
              <p className="text-xs font-bold text-emerald-800">{alertaVerde}</p>
            </div>
          </div>
          <button
            onClick={() => setAlertaVerde('')}
            className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-900 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {alertaRoja && (
        <div className="p-4 bg-rose-100 border-2 border-rose-400 text-rose-950 rounded-2xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-rose-600 shrink-0" />
            <p className="text-sm font-extrabold">{alertaRoja}</p>
          </div>
          <button
            onClick={() => setAlertaRoja('')}
            className="p-1.5 rounded-lg hover:bg-rose-200 text-rose-900 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="bg-slate-50/90 border border-indigo-100 rounded-[26px] p-6 flex items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Registro de Calles, Casas y Familias
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Agrega las calles de tu comunidad, registra a cada Jefe de Casa y anota a los miembros de su hogar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setModalCalle(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold text-indigo-700 bg-white hover:bg-indigo-50 border-2 border-indigo-200 shadow-sm cursor-pointer"
          >
            <MapPin size={18} />
            <span>Agregar Calle</span>
          </button>

          <button
            onClick={() => {
              if (calles.length === 0) {
                mostrarError('Primero debes agregar al menos una calle antes de registrar una casa.');
                return;
              }
              setFormFamilia({
                ...formFamilia,
                calle_id:
                  calleSeleccionada !== 'TODAS' ? calleSeleccionada : calles[0]?.id || '',
              });
              setModalFamilia(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer"
          >
            <Plus size={18} />
            <span>Registrar Jefe de Casa</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCalleSeleccionada('TODAS')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
            calleSeleccionada === 'TODAS'
              ? 'bg-indigo-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-indigo-100 hover:bg-indigo-50'
          }`}
        >
          Todas las Calles ({familias.length} casas)
        </button>

        {calles.map((calle) => {
          const activa = String(calleSeleccionada) === String(calle.id);
          return (
            <div
              key={calle.id}
              className={`inline-flex items-center rounded-2xl border transition shadow-sm overflow-hidden ${
                activa
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-white text-slate-800 border-indigo-100 hover:border-indigo-300'
              }`}
            >
              <button
                onClick={() => setCalleSeleccionada(calle.id)}
                className="px-4 py-2.5 text-sm font-extrabold cursor-pointer flex items-center gap-2"
              >
                <MapPin size={15} className={activa ? 'text-indigo-200' : 'text-indigo-600'} />
                <span>{calle.nombre}</span>
              </button>

              <button
                onClick={() => setCalleAEliminar(calle)}
                title={`Eliminar ${calle.nombre}`}
                className={`px-2.5 py-2.5 border-l transition cursor-pointer ${
                  activa
                    ? 'border-indigo-500 text-indigo-200 hover:bg-rose-600 hover:text-white'
                    : 'border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-3.5 text-indigo-500" />
        <input
          type="text"
          value={busquedaLocal}
          onChange={(e) => setBusquedaLocal(e.target.value)}
          placeholder="Buscar casa o familia por nombre del Jefe de Hogar, cédula o número de casa..."
          className="w-full bg-white border border-indigo-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-indigo-600"
        />
        {busquedaLocal && (
          <button
            onClick={() => setBusquedaLocal('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {familiasFiltradas.length === 0 ? (
        <div className="bg-white rounded-[28px] border-2 border-dashed border-indigo-100 p-12 text-center">
          <Home size={40} className="mx-auto text-indigo-400 mb-3" />
          <h3 className="text-lg font-black text-slate-800">
            No hay casas registradas en esta vista
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Usa el botón &ldquo;+ Registrar Jefe de Casa&rdquo; arriba a la derecha para anotar una vivienda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {familiasFiltradas.map((fam) => {
            const integrantes = fam.habitantes || [];
            return (
              <div
                key={fam.id}
                className="bg-white rounded-[28px] p-6 shadow-sm border border-indigo-100/90 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                      }}
                    >
                      <Home size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-black text-slate-900">
                          {fam.nombre_familia || 'Familia Registrada'}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                          {fam.calles?.nombre || 'Calle'} • Casa {fam.numero_casa || 'S/N'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Users size={14} className="text-indigo-500" />
                          {integrantes.length} personas en la vivienda
                        </span>
                        {fam.telefono_contacto && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={14} className="text-indigo-500" />
                            {fam.telefono_contacto}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => abrirModalNuevoFamiliar(fam.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
                    >
                      <UserPlus size={15} />
                      <span>Agregar Familiar</span>
                    </button>
                    <button
                      onClick={() => handleEliminarFamilia(fam)}
                      title="Eliminar vivienda"
                      className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 cursor-pointer"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs font-black uppercase">
                        <th className="py-3 px-4">Nombre y Apellido</th>
                        <th className="py-3 px-4">Cédula</th>
                        <th className="py-3 px-4">Parentesco</th>
                        <th className="py-3 px-4">Edad</th>
                        <th className="py-3 px-4">Salud</th>
                        <th className="py-3 px-4">Beneficios</th>
                        <th className="py-3 px-4 text-right">Opciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {integrantes.map((hab) => {
                        const edad = calcularEdad(hab.fecha_nacimiento);
                        return (
                          <tr key={hab.id} className="hover:bg-indigo-50/30">
                            <td className="py-3 px-4 font-extrabold text-slate-900">
                              {hab.nombres} {hab.apellidos}
                              {hab.es_jefe_familia && (
                                <span className="ml-2 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-black">
                                  Jefe de Casa
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-700">
                              {hab.cedula || 'Sin cédula'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {hab.parentesco || 'Familiar'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {edad !== null ? `${edad} años` : '-'} ({hab.sexo})
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              <span className="inline-flex items-center gap-1">
                                <HeartPulse size={14} className="text-rose-500" />
                                {hab.condicion_salud || 'Sano'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {Array.isArray(hab.beneficios) && hab.beneficios.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {hab.beneficios.map((b, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold"
                                    >
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold">
                                  Ninguno
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => abrirModalEditarHabitante(hab, fam.id)}
                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                title="Editar datos"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminarHabitante(hab)}
                                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Quitar persona"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalNuevaCalle
        abierto={modalCalle}
        onCerrar={() => setModalCalle(false)}
        onSubmit={handleCrearCalle}
        nombre={nombreNuevaCalle}
        setNombre={setNombreNuevaCalle}
        sector={sectorNuevaCalle}
        setSector={setSectorNuevaCalle}
        procesando={procesando}
      />

      <ModalEliminarCalle
        calle={calleAEliminar}
        onCerrar={() => setCalleAEliminar(null)}
        onConfirmar={handleConfirmarEliminarCalle}
        procesando={procesando}
      />

      <ModalFamilia
        abierto={modalFamilia}
        onCerrar={() => setModalFamilia(false)}
        onSubmit={handleCrearFamilia}
        form={formFamilia}
        setForm={setFormFamilia}
        calles={calles}
        procesando={procesando}
        toggleBeneficio={toggleBeneficio}
      />

      <ModalHabitante
        abierto={modalHabitante}
        onCerrar={() => setModalHabitante(false)}
        onSubmit={handleGuardarHabitante}
        form={formHabitante}
        setForm={setFormHabitante}
        esEdicion={Boolean(habitanteEditandoId)}
        procesando={procesando}
        toggleBeneficio={toggleBeneficio}
      />
    </div>
  );
}