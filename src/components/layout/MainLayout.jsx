import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PieChart,
  MapPin,
  HeartHandshake,
  ArrowLeftRight,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

/**
 * AQUÍ PUEDES CAMBIAR LA IMAGEN DE CADA SECCIÓN DEL SISTEMA.
 * Solo coloca tus imágenes en la carpeta "public/" y cambia la ruta en "imagen".
 */
const CONFIG_SECCIONES = {
  dashboard: {
    titulo: 'Panel General de la Comunidad',
    subtitulo: 'Resumen claro de las familias, vecinos y viviendas de tu sector.',
    etiqueta: 'VISTA PRINCIPAL',
    imagen: '/logins.jpg',
  },
  demografia: {
    titulo: 'Distribución Demográfica',
    subtitulo: 'Cantidad de vecinos por edades: niños, jóvenes, adultos y abuelos.',
    etiqueta: 'EDADES Y POBLACIÓN',
    imagen: '/registro.png',
  },
  calles: {
    titulo: 'Calles y Familias',
    subtitulo: 'Agrega o edita calles, casas, Jefes de Hogar y miembros de cada familia.',
    etiqueta: 'REGISTRO DE HOGARES',
    imagen: '/logins.jpg',
  },
  salud_beneficios: {
    titulo: 'Salud y Beneficios',
    subtitulo: 'Vecinos que reciben bolsas de comida, gas, bonos o requieren atención médica.',
    etiqueta: 'SALUD Y AYUDAS',
    imagen: '/registro.png',
  },
  movimientos: {
    titulo: 'Entradas y Salidas',
    subtitulo: 'Registro de vecinos nuevos que llegan a la comunidad o familias que se mudan.',
    etiqueta: 'HISTORIAL VECINAL',
    imagen: '/logins.jpg',
  },
};

export default function MainLayout({
  children,
  tabActiva,
  setTabActiva,
  busquedaGlobal,
  setBusquedaGlobal,
}) {
  const { user, cerrarSesion, actualizarCredenciales } = useAuth();

  // Estados del menú desplegable "Admin Comunal", alertas y ventana de credenciales
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState(user?.email || '');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [alertaSuperiorVerde, setAlertaSuperiorVerde] = useState('');

  const menuRef = useRef(null);

  useEffect(() => {
    if (user?.email) setNuevoEmail(user.email);
  }, [user]);

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'demografia', label: 'Distribución Demográfica', icon: PieChart },
    { id: 'calles', label: 'Calles y Familias', icon: MapPin },
    { id: 'salud_beneficios', label: 'Salud y Beneficios', icon: HeartHandshake },
    { id: 'movimientos', label: 'Entradas y Salidas', icon: ArrowLeftRight },
  ];

  const infoSeccion = CONFIG_SECCIONES[tabActiva] || CONFIG_SECCIONES.dashboard;

  const abrirModalCredenciales = () => {
    setMenuAbierto(false);
    setMensajeExito('');
    setMensajeError('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setNuevoEmail(user?.email || '');
    setModalAbierto(true);
  };

  const handleGuardarCredenciales = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');

    const emailLimpio = nuevoEmail.trim();
    const cambioEmail = emailLimpio && emailLimpio !== user?.email;
    const cambioPassword = nuevaPassword.length > 0;

    if (!cambioEmail && !cambioPassword) {
      setMensajeError('Escribe un correo nuevo o una contraseña nueva para poder guardar.');
      return;
    }

    if (cambioPassword && nuevaPassword.length < 6) {
      setMensajeError('La contraseña nueva debe tener al menos 6 letras o números.');
      return;
    }

    if (cambioPassword && nuevaPassword !== confirmarPassword) {
      setMensajeError('Las dos contraseñas escritas no coinciden. Por favor verifícalas.');
      return;
    }

    setGuardando(true);
    try {
      await actualizarCredenciales({
        email: cambioEmail ? emailLimpio : undefined,
        password: cambioPassword ? nuevaPassword : undefined,
      });

      const textoConfirmacion =
        cambioEmail && cambioPassword
          ? '¡El correo y la contraseña del Consejo Comunal se actualizaron con éxito!'
          : cambioEmail
          ? '¡El correo electrónico se actualizó con éxito!'
          : '¡La contraseña de acceso se actualizó con éxito!';

      setMensajeExito(textoConfirmacion);
      setAlertaSuperiorVerde(textoConfirmacion);
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err) {
      setMensajeError(
        err.message || 'No se pudieron guardar los cambios. Intenta de nuevo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="min-h-screen min-w-[1280px] p-4 flex gap-5 font-sans text-slate-800 select-none"
      style={{
        background: 'linear-gradient(135deg, #EFD0ED 0%, #E3D1F4 50%, #CFE0FA 100%)',
      }}
    >
      {/* BARRA LATERAL MÁS AMPLIA PARA QUE TODO QUEDE EN UNA SOLA LÍNEA */}
      <aside
        className="w-72 rounded-[30px] text-white flex flex-col justify-between p-5 shadow-[0_20px_50px_rgba(37,99,235,0.25)] shrink-0 relative overflow-hidden border border-white/30"
        style={{
          background: 'linear-gradient(165deg, #1d4ed8 0%, #2563eb 45%, #4f46e5 80%, #9333ea 100%)',
        }}
      >
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#EFD0ED]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo y Título */}
          <div className="flex items-center gap-3.5 px-2 pt-2 pb-7 border-b border-white/15">
            <div className="w-13 h-13 bg-white p-2 rounded-2xl shadow-lg shrink-0 flex items-center justify-center">
              <img src="/registro.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight text-white leading-tight">
                Comuna Activa
              </h2>
              <p className="text-xs text-indigo-100 font-semibold tracking-wide mt-0.5">
                Control Comunitario
              </p>
            </div>
          </div>

          {/* Navegación con tipografía más grande y en una sola línea */}
          <nav className="space-y-2.5 mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const activo = tabActiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTabActiva(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    activo
                      ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/20 scale-[1.01]'
                      : 'text-indigo-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${activo ? 'text-blue-600' : 'text-indigo-200'}`}
                  />
                  <span className=" whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie del Sidebar */}
        <div className="relative z-10 pt-4 border-t border-white/15 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
            <p className="text-xs font-black uppercase tracking-wider text-[#EFD0ED]">
              Líder de Calle
            </p>
            <p className="text-sm text-white font-bold truncate mt-1">
              {user?.email || 'lider@comuna.com'}
            </p>
          </div>

          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold text-rose-100 hover:bg-rose-500/25 hover:text-white transition cursor-pointer"
          >
            <LogOut size={19} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 bg-white/85 backdrop-blur-md rounded-[32px] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-white flex flex-col justify-between overflow-x-hidden">
        <div>
          {/* CUADRO VERDE DE ALERTA SUPERIOR CUANDO SE ACTUALIZAN DATOS */}
          {alertaSuperiorVerde && (
            <div className="mb-5 p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-black">¡Cambio guardado correctamente!</p>
                  <p className="text-xs font-semibold text-emerald-800">
                    {alertaSuperiorVerde}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAlertaSuperiorVerde('')}
                className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* BARRA SUPERIOR */}
          <header className="flex items-center justify-between gap-4 mb-6">
            {/* Buscador Superior */}
            <div className="relative w-[440px]">
              <Search size={18} className="absolute left-4 top-3.5 text-indigo-500" />
              <input
                type="text"
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                placeholder="Buscar vecino por nombre, cédula, calle o beneficio..."
                className="w-full bg-white border border-indigo-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition"
              />
              {busquedaGlobal && (
                <button
                  onClick={() => setBusquedaGlobal('')}
                  title="Limpiar búsqueda"
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Acciones Derecha + Menú Desplegable Admin Comunal */}
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setTabActiva('movimientos')}
                title="Ver entradas y salidas de vecinos"
                className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 shadow-sm transition cursor-pointer relative"
              >
                <Bell size={20} />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2.5 right-2.5" />
              </button>

              {/* MENÚ DESPLEGABLE ADMIN COMUNAL */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-3 bg-white hover:bg-indigo-50/60 border border-indigo-100 rounded-2xl px-4 py-2.5 shadow-sm transition cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    }}
                  >
                    CC
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-sm font-black text-slate-800 leading-none">
                      Admin Comunal
                    </p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">
                      Líder de Calle
                    </p>
                  </div>
                  <ChevronDown
                    size={17}
                    className={`text-slate-400 transition-transform duration-200 ${
                      menuAbierto ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>

                {/* Menú flotante al hacer clic en Admin Comunal */}
                {menuAbierto && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-indigo-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                        Cuenta Conectada
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                        {user?.email || 'lider@comuna.com'}
                      </p>
                    </div>

                    <div className="p-2 space-y-1.5">
                      <button
                        onClick={abrirModalCredenciales}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <KeyRound size={17} />
                        </div>
                        <div>
                          <span className="block leading-none font-extrabold">
                            Cambiar Correo y Contraseña
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-1 block">
                            Actualizar datos del Consejo Comunal
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setMenuAbierto(false);
                          cerrarSesion();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <LogOut size={17} />
                        </div>
                        <div>
                          <span className="block leading-none font-extrabold">
                            Cerrar Sesión
                          </span>
                          <span className="text-xs text-rose-400 font-medium mt-1 block">
                            Salir de la cuenta de forma segura
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* BANNER DE SECCIÓN CON ESPACIO PARA IMAGEN PERSONALIZADA */}
          <div
            className="mb-6 rounded-[26px] p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between border border-white/60"
            style={{
              background: 'linear-gradient(120deg, #1d4ed8 0%, #3b82f6 52%, #EFD0ED 100%)',
            }}
          >
            <div className="relative z-10 max-w-2xl pl-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-widest text-white mb-2.5">
                <Sparkles size={14} />
                {infoSeccion.etiqueta}
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {infoSeccion.titulo}
              </h1>
              <p className="text-sm font-semibold text-indigo-50 mt-1.5">
                {infoSeccion.subtitulo}
              </p>
            </div>

            {/* ESPACIO DE IMAGEN DE LA SECCIÓN ACTIVA */}
            <div className="relative z-10 flex items-center gap-4 pr-3">
              <div className="w-32 h-24 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white shadow-md p-2.5 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={infoSeccion.imagen}
                  alt={infoSeccion.titulo}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* CONTENIDO DE LA SECCIÓN */}
          <div>{children}</div>
        </div>
      </main>

      {/* VENTANA PARA CAMBIAR CORREO Y CONTRASEÑA DEL CONSEJO COMUNAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Cabecera */}
            <div
              className="p-6 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #EFD0ED 100%)',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <KeyRound size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Cambiar Correo y Contraseña
                  </h3>
                  <p className="text-xs font-semibold text-indigo-50">
                    Datos de acceso del Consejo Comunal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarCredenciales} className="p-6 space-y-5">
              {/* CUADRO VERDE DE CONFIRMACIÓN */}
              {mensajeExito && (
                <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl text-sm font-extrabold flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="block font-black">¡Actualización Exitosa!</span>
                    <span className="text-xs font-semibold text-emerald-800">
                      {mensajeExito}
                    </span>
                  </div>
                </div>
              )}

              {/* CUADRO ROJO EN CASO DE ERROR */}
              {mensajeError && (
                <div className="p-4 bg-rose-100 border-2 border-rose-400 text-rose-900 rounded-2xl text-sm font-extrabold flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0 text-rose-600" />
                  <span>{mensajeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  CORREO DEL CONSEJO COMUNAL
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    placeholder="lider@comuna.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  NUEVA CONTRASEÑA (OPCIONAL)
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Escribe la nueva contraseña (mínimo 6 caracteres)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-11 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPass(!mostrarPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {mostrarPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  REPETIR NUEVA CONTRASEÑA
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Vuelve a escribir la nueva contraseña"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}