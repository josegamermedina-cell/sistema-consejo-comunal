// Calcula la edad exacta en años a partir de la fecha de nacimiento (YYYY-MM-DD)
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// Genera el resumen estadístico a partir de la lista de habitantes y familias
export const obtenerResumenEstadistico = (habitantes = [], familias = []) => {
  // Solo contamos los habitantes y familias que están actualmente activos en la comunidad
  const habitantesActivos = habitantes.filter((h) => h.estado === 'activo');
  const familiasActivas = familias.filter((f) => f.activo === true);

  let ninosMenores12 = 0;
  let ninasMenores12 = 0;
  let mujeresMayores55 = 0;
  let hombresMayores60 = 0;
  let embarazadas = 0;
  let conPatologias = 0;
  let conBeneficios = 0;

  habitantesActivos.forEach((persona) => {
    const edad = calcularEdad(persona.fecha_nacimiento);

    // Niños y niñas menores de 12 años
    if (edad < 12) {
      if (persona.sexo === 'M') ninosMenores12++;
      if (persona.sexo === 'F') ninasMenores12++;
    }

    // Mujeres mayores de 55 años y hombres mayores de 60 años
    if (persona.sexo === 'F' && edad > 55) {
      mujeresMayores55++;
    }
    if (persona.sexo === 'M' && edad > 60) {
      hombresMayores60++;
    }

    // Mujeres embarazadas
    if (persona.sexo === 'F' && persona.embarazada) {
      embarazadas++;
    }

    // Resultados de patologías
    if (persona.tiene_patologia) {
      conPatologias++;
    }

    // Personas que reciben beneficios
    if (persona.recibe_beneficio) {
      conBeneficios++;
    }
  });

  return {
    totalFamilias: familiasActivas.length,
    totalHabitantes: habitantesActivos.length,
    ninosMenores12,
    ninasMenores12,
    totalMenores12: ninosMenores12 + ninasMenores12,
    mujeresMayores55,
    hombresMayores60,
    totalAdultosMayores: mujeresMayores55 + hombresMayores60,
    embarazadas,
    conPatologias,
    conBeneficios,
  };
};