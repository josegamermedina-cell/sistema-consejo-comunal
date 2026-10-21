import { useEffect, useState } from 'react';
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

  const cargarTodo = async (esPrimeraCarga = false) => {
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
      console.error('Error cargando datos del censo:', err.message);
    } finally {
      setCargandoInicial(false);
      setSincronizando(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarTodo(true);
    }
  }, [user]);

  if (loading || (user && cargandoInicial)) {
    return (
      <LoaderComunal
        pantallaCompleta={true}
        texto="Sincronizando Censo y Estadísticas del Consejo Comunal..."
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
            texto="Actualizando datos de la comunidad..."
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