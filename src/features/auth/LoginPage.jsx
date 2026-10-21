import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Remueve el fondo negro de logins.jpg automáticamente
 * para que las líneas y los personajes resalten de forma limpia.
 */
function IlustracionSinFondo({ src, alt, className }) {
  const [imagenProcesada, setImagenProcesada] = useState(src);
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxChannel = Math.max(r, g, b);

          if (maxChannel < 18) {
            data[i + 3] = 0;
          } else if (maxChannel < 42) {
            data[i + 3] = Math.round(((maxChannel - 18) / 24) * 255);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setImagenProcesada(canvas.toDataURL('image/png'));
      } catch (e) {
        setImagenProcesada(src);
      }
    };
  }, [src]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <img
        src={imagenProcesada}
        alt={alt}
        className={className}
        style={{
          filter: 'drop-shadow(0px 12px 24px rgba(15, 23, 42, 0.25))',
        }}
      />
    </>
  );
}

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
    <div 
      className="min-h-screen min-w-[1280px] w-full flex items-center justify-center p-10 font-sans select-none"
      style={{ backgroundColor: '#EFD0ED' }}
    >
      
      {/* TARJETA CENTRAL DIVIDIDA EN 2 COLUMNAS */}
      <div className="w-[1040px] min-h-[630px] bg-white rounded-2xl shadow-[0_25px_70px_rgba(15,23,42,0.18)] grid grid-cols-2 overflow-hidden border border-white/90">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="bg-white px-14 py-12 flex flex-col justify-between">
          
          {/* Membrete superior con tu logo registro.png */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 p-1.5 flex items-center justify-center shadow-sm">
              <img
                src="/registro.png"
                alt="Logo Sistema"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider uppercase text-slate-900 block leading-none">
                Comuna Activa
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Control de Calles y Familias
              </span>
            </div>
          </div>

          {/* Bloque central del formulario */}
          <div className="my-auto py-6">
            <h1 className="text-[28px] font-extrabold text-slate-950 tracking-tight mb-2">
              Iniciar sesión
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-7 leading-relaxed">
              Acceso exclusivo para Liderazgo de Calle. Ingresa tus credenciales para gestionar el padrón familiar.
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-2">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  required
                  maxLength={80}
                  placeholder="lider@comuna.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 80))}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-4 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-2">
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    maxLength={64}
                    placeholder="Escribe tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-4 pr-10 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition cursor-pointer text-[11px] uppercase tracking-[0.15em]"
              >
                <span>{cargando ? 'VERIFICANDO...' : 'INGRESAR AL SISTEMA'}</span>
                {!cargando && <ArrowRight size={15} />}
              </button>
            </form>
          </div>

          {/* Pie inferior izquierdo */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              Sistema de Control Territorial • <span className="font-bold text-slate-700">Liderazgo de Calle</span>
            </p>
          </div>

        </div>

        {/* COLUMNA DERECHA: PANEL CON GRADIENTE Y EL COLOR #EFD0ED */}
        <div 
          className="flex flex-col items-center justify-between pt-12 pb-8 px-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #EFD0ED 100%)'
          }}
        >
          
          {/* Círculos de luz decorativos suaves */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center z-10">
            <h2 className="text-[38px] font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">
              ¡Bienvenido!
            </h2>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.22em] mt-2.5">
              ORGANIZACIÓN Y CONTROL DE TU SECTOR
            </p>
          </div>

          {/* Ilustración nítida */}
          <div className="w-full flex items-center justify-center z-10 my-auto py-2">
            <IlustracionSinFondo
              src="/logins.jpg"
              alt="Control de la Comunidad"
              className="w-full max-w-[475px] scale-110 h-auto object-contain transform hover:scale-[1.13] transition duration-500"
            />
          </div>

          <div className="text-[11px] font-semibold text-slate-800 tracking-wider z-10">
            Registro Familiar • Censos • Movimientos Vecinales
          </div>

        </div>

      </div>
    </div>
  );
}