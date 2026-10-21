import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const correoLimpio = email.trim().slice(0, 80);
    if (!correoLimpio || password.length < 6) {
      setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(correoLimpio, password.slice(0, 64));
    } catch (err) {
      setError('Credenciales incorrectas. Verifica el correo y la contraseña asignados.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-start px-6 py-10 sm:px-16 md:px-24 lg:px-32 font-sans overflow-hidden select-none">
      
      {/* IMAGEN DE FONDO: Familia en la comunidad al atardecer (Iluminada y nítida a la derecha) */}
      <div
        className="absolute inset-0 bg-cover bg-[center_right] sm:bg-center z-0 transition-transform duration-700"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=85&w=1920')`,
        }}
      />

      {/* Degradado suave solo a la izquierda para resaltar el logo blanco sin oscurecer a la familia */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-900/25 to-transparent z-0" />

      {/* CONTENEDOR ALINEADO A LA IZQUIERDA (Logo arriba separado + Tarjeta translúcida abajo) */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col">
        
        {/* 1. LOGOTIPO TIPO ESCUDO Y TÍTULO ARRIBA FUERA DEL CUADRO */}
        <div className="flex items-center gap-3.5 mb-7 pl-1">
          {/* Escudo Índigo con ícono de comunidad */}
          <div
            className="w-13 h-14 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xl border-2 border-indigo-300/60 shrink-0"
            style={{
              clipPath: 'polygon(50% 0%, 100% 18%, 100% 68%, 50% 100%, 0% 68%, 0% 18%)',
            }}
          >
            <Building2 size={24} className="drop-shadow" />
          </div>

          <div className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]">
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">
              Comuna App
            </h2>
            <span className="block text-xs font-bold text-indigo-100 uppercase tracking-[0.2em] mt-1">
              CONSEJO COMUNAL
            </span>
          </div>
        </div>

        {/* 2. CUADRO TRANSLÚCIDO (Efecto cristal esmerilado igual a la imagen) */}
        <div className="w-full bg-[#ECEFF4]/85 backdrop-blur-md rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/60 text-slate-900">
          
          {/* Encabezado e información breve del sistema */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Acceso al Sistema
            </h1>
            <p className="text-sm font-extrabold text-[#3730A3] mt-1">
              Sistema de Censo y Gestión Demográfica
            </p>
            <p className="text-xs sm:text-[13px] font-medium text-slate-700 mt-2.5 leading-relaxed">
              Por favor, ingresa tus credenciales autorizadas para administrar calles y núcleos familiares.
            </p>
          </div>

          {/* Alerta de error si falla el login */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-100/95 border-2 border-rose-300 text-rose-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">
                USUARIO / CORREO ELECTRÓNICO
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  maxLength={80}
                  placeholder="admin@consejocomunal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 80))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  maxLength={64}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-2 bg-[#3730A3] hover:bg-[#312E81] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
            >
              <span>{cargando ? 'Verificando...' : 'Iniciar Sesión'}</span>
              {!cargando && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Pie de tarjeta con línea divisoria sutil */}
          <div className="mt-6 text-center border-t border-slate-300/80 pt-4">
            <p className="text-xs font-medium text-slate-600">
              Plataforma Oficial del Consejo Comunal
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}