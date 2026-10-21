import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const iniciarSesion = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const actualizarCredenciales = async ({ email, password }) => {
    const cambios = {};
    if (email && email.trim() !== '') cambios.email = email.trim();
    if (password && password !== '') cambios.password = password;

    const { data, error } = await supabase.auth.updateUser(cambios);
    if (error) throw error;
    if (data?.user) setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        iniciarSesion,
        cerrarSesion,
        actualizarCredenciales,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);