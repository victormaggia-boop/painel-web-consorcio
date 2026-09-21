import { useState } from 'react';
import { supabase } from './supabaseClient'; // Ajuste o caminho se necessário

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setError(error.message);
    else onLogin(data.session);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Acesso Restrito</h2>
        {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}
        
        <input type="email" placeholder="E-mail" required className="w-full mb-4 p-3 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Palavra-passe" required className="w-full mb-6 p-3 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} />
        
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition">
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}