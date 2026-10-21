import { useEffect, useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardView from './features/dashboard/DashboardView';
import DemografiaSaludView from './features/dashboard/DemografiaSaludView';
import CallesFamiliasView from './features/calles/CallesFamiliasView';
import MovimientosView from './features/movimientos/MovimientosView';
import LoaderComunal from './components/ui/LoaderComunal';
import {
  obtenerCalles,
  obtenerFamiliasCompletas,
  obtenerTodosLosHabitantes,
  obtenerMovimientos,
} from './services/censoService';

function ContenidoPrincipal() {
  const { user, loading } = useAuth();
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  const [calles, setCalles] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [habitantes, setHabitantes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);

  const ultimoUserId = useRef(null);

  // Función optimizada para recargar datos y refrescar la interfaz al instante
  const cargarTodo = useCallback(async (esPrimeraCarga = false) => {
    if (!user) return;
    if (esPrimeraCarga) setCargandoInicial(true);
    else setSincronizando(true);

    try {
      const [listaCalles, listaFamilias, listaHabitantes, listaMovimientos] =
        await Promise.all([
          obtenerCalles(),
          obtenerFamiliasCompletas(),
          obtenerTodosLosHabitantes(),
          obtenerMovimientos(),
        ]);
      
      setCalles(listaCalles || []);
      setFamilias(listaFamilias || []);
      setHabitantes(listaHabitantes || []);
      setMovimientos(listaMovimientos || []);
    } catch (err) {
      console.error('Error cargando datos de la comunidad:', err.message);
    } finally {
      setCargandoInicial(false);
      setSincronizando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      if (ultimoUserId.current !== user.id) {
        ultimoUserId.current = user.id;
        cargarTodo(true);
      }
    } else {
      ultimoUserId.current = null;
    }
  }, [user?.id, cargarTodo]);

  if (loading || (user && cargandoInicial)) {
    return (
      <LoaderComunal
        pantallaCompleta={true}
        texto="Cargando datos de la comunidad..."
      />
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-w-[1280px]">
      <MainLayout
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        busquedaGlobal={busquedaGlobal}
        setBusquedaGlobal={setBusquedaGlobal}
      >
        {sincronizando && (
          <LoaderComunal
            pantallaCompleta={false}
            texto="Actualizando información..."
          />
        )}

        {tabActiva === 'dashboard' && (
          <DashboardView
            habitantes={habitantes}
            familias={familias}
            calles={calles}
            busquedaGlobal={busquedaGlobal}
            irACalles={() => setTabActiva('calles')}
            recargarDatos={() => cargarTodo(false)}
          />
        )}

        {tabActiva === 'demografia' && (
          <DemografiaSaludView
            habitantes={habitantes}
            familias={familias}
            modo="demografia"
            busquedaGlobal={busquedaGlobal}
          />
        )}

        {tabActiva === 'calles' && (
          <CallesFamiliasView
            calles={calles}
            familias={familias}
            recargarDatos={() => cargarTodo(false)}
            busquedaGlobal={busquedaGlobal}
          />
        )}

        {tabActiva === 'salud_beneficios' && (
          <DemografiaSaludView
            habitantes={habitantes}
            familias={familias}
            modo="salud_beneficios"
            busquedaGlobal={busquedaGlobal}
          />
        )}

        {tabActiva === 'movimientos' && (
          <MovimientosView
            habitantes={habitantes}
            movimientos={movimientos}
            recargarDatos={() => cargarTodo(false)}
          />
        )}
      </MainLayout>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContenidoPrincipal />
    </AuthProvider>
  );
}