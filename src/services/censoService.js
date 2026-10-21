import { supabase } from '../lib/supabaseClient';

// Validar si una cédula ya está registrada en la comunidad
export const verificarCedulaDuplicada = async (cedula, idExcluir = null) => {
  if (!cedula || !cedula.trim()) return false;
  let query = supabase
    .from('habitantes')
    .select('id, nombres, apellidos')
    .eq('cedula', cedula.trim());

  if (idExcluir) {
    query = query.neq('id', idExcluir);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data && data.length > 0 ? data[0] : false;
};

// 1. Obtener todas las calles
export const obtenerCalles = async () => {
  const { data, error } = await supabase
    .from('calles')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
};

// 2. Crear una nueva calle
export const crearCalle = async (nuevaCalle) => {
  const { data, error } = await supabase
    .from('calles')
    .insert([nuevaCalle])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// 3. Obtener todas las familias con su calle y todos sus integrantes
export const obtenerFamiliasCompletas = async () => {
  const { data, error } = await supabase
    .from('familias')
    .select(`
      *,
      calles ( id, nombre, sector, lider_calle ),
      habitantes ( * )
    `)
    .order('numero_casa', { ascending: true });
  if (error) throw error;
  return data;
};

// 4. Obtener todos los habitantes
export const obtenerTodosLosHabitantes = async () => {
  const { data, error } = await supabase
    .from('habitantes')
    .select(`
      *,
      familias ( numero_casa, nombre_familia, calles ( nombre ) )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// 5. Registrar una nueva Familia junto con su Jefe de Casa
export const registrarFamiliaYJefe = async (datosFamilia, datosJefe) => {
  if (datosJefe.cedula) {
    const duplicado = await verificarCedulaDuplicada(datosJefe.cedula);
    if (duplicado) {
      throw new Error(
        `La cédula ${datosJefe.cedula} ya está registrada a nombre de ${duplicado.nombres} ${duplicado.apellidos}.`
      );
    }
  }

  const { data: familia, error: errorFamilia } = await supabase
    .from('familias')
    .insert([datosFamilia])
    .select()
    .single();

  if (errorFamilia) throw errorFamilia;

  const { data: jefe, error: errorJefe } = await supabase
    .from('habitantes')
    .insert([
      {
        ...datosJefe,
        familia_id: familia.id,
        es_jefe_familia: true,
        parentesco: 'Jefe de Casa',
        estado: 'activo',
      },
    ])
    .select()
    .single();

  if (errorJefe) throw errorJefe;

  return { familia, jefe };
};

// 6. Agregar un integrante a una familia existente
export const agregarIntegrante = async (
  datosIntegrante,
  registrarMovimiento = false,
  motivo = 'Nuevo registro'
) => {
  if (datosIntegrante.cedula) {
    const duplicado = await verificarCedulaDuplicada(datosIntegrante.cedula);
    if (duplicado) {
      throw new Error(
        `La cédula ${datosIntegrante.cedula} ya pertenece a ${duplicado.nombres} ${duplicado.apellidos}.`
      );
    }
  }

  const { data: habitante, error } = await supabase
    .from('habitantes')
    .insert([{ ...datosIntegrante, estado: 'activo' }])
    .select()
    .single();

  if (error) throw error;

  if (registrarMovimiento) {
    await supabase.from('movimientos_comunidad').insert([
      {
        habitante_id: habitante.id,
        tipo_movimiento: 'ingreso',
        motivo,
      },
    ]);
  }

  return habitante;
};

// 7. Actualizar datos de cualquier habitante
export const actualizarHabitante = async (id, cambios) => {
  if (cambios.cedula) {
    const duplicado = await verificarCedulaDuplicada(cambios.cedula, id);
    if (duplicado) {
      throw new Error(
        `La cédula ${cambios.cedula} ya pertenece a ${duplicado.nombres} ${duplicado.apellidos}.`
      );
    }
  }

  const { data, error } = await supabase
    .from('habitantes')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 8. Registrar salida o reingreso de alguien en la comunidad
export const cambiarEstadoHabitante = async (habitanteId, nuevoEstado, motivo) => {
  const tipoMovimiento = nuevoEstado === 'activo' ? 'reingreso' : 'salida';
  const fechaSalida =
    nuevoEstado === 'activo' ? null : new Date().toISOString().split('T')[0];

  const { error: errorUpdate } = await supabase
    .from('habitantes')
    .update({
      estado: nuevoEstado,
      fecha_salida: fechaSalida,
      motivo_salida: nuevoEstado === 'activo' ? null : motivo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', habitanteId);

  if (errorUpdate) throw errorUpdate;

  const { error: errorMov } = await supabase.from('movimientos_comunidad').insert([
    {
      habitante_id: habitanteId,
      tipo_movimiento: tipoMovimiento,
      motivo,
    },
  ]);

  if (errorMov) throw errorMov;
};

// 9. Obtener historial de movimientos
export const obtenerMovimientos = async () => {
  const { data, error } = await supabase
    .from('movimientos_comunidad')
    .select(`
      *,
      habitantes (
        nombres,
        apellidos,
        cedula,
        familias ( numero_casa, calles ( nombre ) )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 10. Eliminar un integrante de la familia
export const eliminarHabitante = async (habitanteId) => {
  const { error } = await supabase.from('habitantes').delete().eq('id', habitanteId);
  if (error) throw error;
};

// 11. Eliminar una familia/casa completa (elimina también sus integrantes por CASCADE)
export const eliminarFamiliaCompleta = async (familiaId) => {
  const { error } = await supabase.from('familias').delete().eq('id', familiaId);
  if (error) throw error;
};