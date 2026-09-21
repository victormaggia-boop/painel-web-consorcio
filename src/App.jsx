import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
import Login from './Login';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Verifica se já há login guardado no navegador
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    // Fica à escuta de mudanças (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Se não houver sessão, mostra o ecrã de Login. Se houver, mostra o Painel.
  return session ? <AdminDashboard session={session} /> : <Login onLogin={setSession} />;
}