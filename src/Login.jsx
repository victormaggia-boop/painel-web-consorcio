import { useState } from 'react';
import { supabase } from './supabaseClient'; // Ajuste o caminho se necessário
import { Mail, Lock, LogIn, UserPlus, Building2 } from 'lucide-react'; // Ícones para um visual mais profissional

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Credenciais inválidas. Verifique os seus dados.');
      else onLogin(data.session);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Conta criada com sucesso! Pode iniciar sessão.');
        setIsLogin(true);
        setPassword('');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* --- Imagem de Fundo (Wallaper Corporativo) --- */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          // Pode trocar esta URL por outra imagem se preferir
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" 
        }}
      >
        {/* Camadas de escurecimento para dar contraste e tom executivo */}
        <div className="absolute inset-0 bg-[#0a192f]/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* --- Logotipo / Título --- */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 backdrop-blur-sm mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Consórcio<span className="text-blue-500">SDR</span></h1>
          <p className="text-blue-200/60 mt-2 text-xs font-semibold uppercase tracking-[0.2em]">Painel de Comando Executivo</p>
        </div>

        {/* --- Cartão de Login (Efeito Vidro / Glassmorphism) --- */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-500">
          <h2 className="text-xl font-semibold mb-6 text-white text-center">
            {isLogin ? 'Acesso Restrito' : 'Registo de Corretor'}
          </h2>
          
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center backdrop-blur-sm">{error}</div>}
          {success && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-4 text-sm text-center backdrop-blur-sm">{success}</div>}
          
          <div className="space-y-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                placeholder="E-mail corporativo" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                placeholder="Palavra-passe" 
                required 
                minLength="6"
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border border-blue-500/50 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all flex justify-center items-center gap-2">
            {loading ? 'A processar...' : (isLogin ? <><LogIn size={18} /> Autenticar</> : <><UserPlus size={18} /> Criar Conta</>)}
          </button>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }} 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? 'Sem acesso? Solicite uma conta aqui.' : 'Já tem acesso? Inicie sessão.'}
            </button>
          </div>
        </form>
        
        {/* --- Rodapé discreto --- */}
        <div className="text-center mt-8 text-gray-500/60 text-xs">
          &copy; {new Date().getFullYear()} Consórcio SDR App. <br/> Protegido por encriptação de ponta-a-ponta.
        </div>

      </div>
    </div>
  );
}