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
            texto="Actualizando registros..."
          />
        )}
        {/* Vistas del sistema */}
        ...
      </MainLayout>
    </div>
  );