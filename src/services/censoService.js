import { supabase } from '../lib/supabaseClient';

export async function obtenerCalles() {
  console.log('🔄 Consultando calles en Supabase...');
  const { data, error } = await supabase
    .from('calles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error al obtener calles:', error.message);
    throw error;
  }
  console.log('✅ Calles obtenidas de Supabase:', data);
  return data || [];
}

export async function crearCalle(calle) {
  console.log('📤 Intentando guardar calle en Supabase:', calle);
  const { data, error } = await supabase
    .from('calles')
    .insert([calle])
    .select();
  
  if (error) {
    console.error('❌ Error al insertar calle:', error.message);
    throw error;
  }
  console.log('✅ Calle guardada con éxito en Supabase:', data);
  return data ? data[0] : null;
}

export async function eliminarCalle(calleId) {
  const { data: familiasDeCalle } = await supabase
    .from('familias')
    .select('id')
    .eq('calle_id', calleId);

  if (familiasDeCalle && familiasDeCalle.length > 0) {
    const idsFamilias = familiasDeCalle.map((f) => f.id);
    await supabase.from('habitantes').delete().in('familia_id', idsFamilias);
    await supabase.from('familias').delete().eq('calle_id', calleId);
  }

  const { error } = await supabase.from('calles').delete().eq('id', calleId);
  if (error) throw error;
  return true;
}

export async function obtenerFamiliasCompletas() {
  const { data, error } = await supabase
    .from('familias')
    .select(`
      *,
      calles (*),
      habitantes (*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function crearFamiliaConJefe(familiaData, jefeData) {
  const { data: famData, error: famError } = await supabase
    .from('familias')
    .insert([familiaData])
    .select();
  if (famError) throw famError;

  const nuevaFamiliaId = famData[0].id;

  const { error: jefeError } = await supabase.from('habitantes').insert([
    {
      ...jefeData,
      familia_id: nuevaFamiliaId,
      es_jefe_familia: true,
    },
  ]);
  if (jefeError) throw jefeError;

  return famData[0];
}

export async function eliminarFamilia(familiaId) {
  await supabase.from('habitantes').delete().eq('familia_id', familiaId);
  const { error } = await supabase.from('familias').delete().eq('id', familiaId);
  if (error) throw error;
  return true;
}

export async function obtenerTodosLosHabitantes() {
  const { data, error } = await supabase
    .from('habitantes')
    .select(`
      *,
      familias (
        *,
        calles (*)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function agregarHabitante(habitante) {
  const { data, error } = await supabase
    .from('habitantes')
    .insert([habitante])
    .select();
  if (error) throw error;
  return data[0];
}

export async function actualizarHabitante(id, habitante) {
  const { data, error } = await supabase
    .from('habitantes')
    .update(habitante)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function eliminarHabitante(id) {
  const { error } = await supabase.from('habitantes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function obtenerMovimientos() {
  const { data, error } = await supabase
    .from('movimientos_comunidad')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error al obtener movimientos:', error.message);
    return [];
  }
  return data || [];
}

export async function cambiarEstadoHabitante(habitanteId, nuevoEstado, motivo = '') {
  const { data, error } = await supabase
    .from('habitantes')
    .update({ estado: nuevoEstado, motivo_salida: motivo })
    .eq('id', habitanteId)
    .select();
  if (error) throw error;
  return data[0];
}