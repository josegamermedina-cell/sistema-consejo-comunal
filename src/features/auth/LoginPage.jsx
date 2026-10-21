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
    <div className="relative min-h-screen min-w-[1280px] w-full flex items-center justify-start px-32 font-sans overflow-hidden select-none bg-slate-950">
      
      {/* IMAGEN DE FONDO: Familia en la comunidad al atardecer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=85&w=1920')`,
        }}
      />

      {/* Degradado suave a la izquierda para resaltar el logo y la tarjeta */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/30 to-transparent z-0" />

      {/* CONTENEDOR PRINCIPAL FIJO (Escala idéntica de computadora) */}
      <div className="relative z-10 w-[420px] flex flex-col">
        
        {/* 1. LOGOTIPO Y TÍTULO ARRIBA */}
        <div className="flex items-center gap-3.5 mb-6 pl-1">
          <div
            className="w-12 h-13 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xl border-2 border-indigo-300/60 shrink-0"
            style={{
              clipPath: 'polygon(50% 0%, 100% 18%, 100% 68%, 50% 100%, 0% 68%, 0% 18%)',
            }}
          >
            <Building2 size={22} className="drop-shadow" />
          </div>

          <div className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]">
            <h2 className="text-2xl font-extrabold tracking-tight text-white leading-none">
              Comuna App
            </h2>
            <span className="block text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em] mt-1">
              CONSEJO COMUNAL
            </span>
          </div>
        </div>

        {/* 2. CUADRO TRANSLÚCIDO COMPACTO */}
        <div className="w-full bg-[#ECEFF4]/90 backdrop-blur-md rounded-[28px] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/60 text-slate-900">
          
          <div className="mb-5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Acceso al Sistema
            </h1>
            <p className="text-xs font-extrabold text-[#3730A3] mt-0.5">
              Sistema de Censo y Gestión Demográfica
            </p>
            <p className="text-[12px] font-medium text-slate-700 mt-2 leading-relaxed">
              Por favor, ingresa tus credenciales autorizadas para administrar calles y núcleos familiares.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-100/95 border-2 border-rose-300 text-rose-800 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                USUARIO / CORREO ELECTRÓNICO
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  maxLength={80}
                  placeholder="admin@consejocomunal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 80))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  maxLength={64}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-2 bg-[#3730A3] hover:bg-[#312E81] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold py-3 px-5 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
            >
              <span>{cargando ? 'Verificando...' : 'Iniciar Sesión'}</span>
              {!cargando && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-slate-300/80 pt-3.5">
            <p className="text-[11px] font-medium text-slate-600">
              Plataforma Oficial del Consejo Comunal
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}