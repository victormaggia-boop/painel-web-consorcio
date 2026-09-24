import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import AdminMaster from './AdminMaster'; // Importação do novo painel

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Verifica se já há login guardado no navegador
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    // Fica à escuta de mudanças (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Se não houver sessão, mostra o ecrã de Login
  if (!session) {
    return <Login onLogin={setSession} />;
  }

  // Verifica se o e-mail logado é o do administrador supremo
  // SUBSTITUA ESTE E-MAIL PELO SEU E-MAIL REAL DE ADMIN
  const isAdmin = session.user.email === 'victormaggia@gmail.com';

  // Se for admin, mostra o Master Admin. Caso contrário, mostra o Dashboard normal do cliente.
  return isAdmin ? <AdminMaster /> : <AdminDashboard session={session} />;
}