import { useState } from 'react';
import { supabase } from './supabaseClient'; // Ajuste o caminho se necessário

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Novo estado para mensagem de sucesso
  const [isLogin, setIsLogin] = useState(true); // Novo estado para alternar entre Login e Cadastro

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (isLogin) {
      // Lógica de Login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin(data.session);
    } else {
      // Lógica de Cadastro (Registo)
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Conta criada com sucesso! Pode entrar agora.');
        setIsLogin(true); // Volta para o ecrã de login após criar a conta
        setPassword(''); // Limpa a palavra-passe por segurança
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Acesso Restrito' : 'Criar Nova Conta'}
        </h2>
        
        {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}
        {success && <p className="text-green-400 mb-4 text-sm text-center">{success}</p>}
        
        <input 
          type="email" 
          placeholder="E-mail" 
          required 
          className="w-full mb-4 p-3 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        
        <input 
          type="password" 
          placeholder="Palavra-passe (mínimo 6 caracteres)" 
          required 
          minLength="6"
          className="w-full mb-6 p-3 bg-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition">
          {loading ? 'A processar...' : (isLogin ? 'Entrar' : 'Registar')}
        </button>

        {/* Botão para alternar entre as abas */}
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }} 
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Não tem conta? Registe-se aqui.' : 'Já tem uma conta? Inicie sessão.'}
          </button>
        </div>
      </form>
    </div>
  );
}