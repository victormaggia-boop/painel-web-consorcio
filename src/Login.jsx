import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Mail, Lock, LogIn, UserPlus, Building2, Key } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  // A SUA CHAVE MESTRA DE SEGURANÇA
  const CHAVE_MESTRA = 'SDR-PRO-2026';

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
      if (inviteCode !== CHAVE_MESTRA) {
        setError('Código de autorização inválido. Registo bloqueado.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Conta criada com sucesso! Pode iniciar sessão.');
        setIsLogin(true);
        setPassword('');
        setInviteCode('');
      }
    }
    
    setLoading(false);
  };

  return (
    // Fundo Principal - Preto Espacial #050508
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-[#050508]">
      
      {/* Efeito Holográfico Subtil no Fundo (Baseado na secção 8.2 do Manual) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0B192C] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0B192C]/50 border border-[#8D99AE]/20 backdrop-blur-sm mb-4 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <Building2 className="w-8 h-8 text-[#00E5FF]" />
          </div>
          {/* Tipografia Orbitron para o Título */}
          <h1 className="text-3xl font-bold text-[#FFFFFF] tracking-tight font-['Orbitron']">
            Maggia<span className="text-[#00E5FF]">SDR</span>
          </h1>
          <p className="text-[#8D99AE] mt-2 text-xs font-semibold uppercase tracking-[0.2em] font-['Inter']">Painel de Comando Executivo</p>
        </div>

        {/* Cartão de Login - Glassmorphism (Fundo Azul Noturno #0B192C com Blur) */}
        <form onSubmit={handleSubmit} className="bg-[#0B192C]/80 backdrop-blur-[12px] border border-[#8D99AE]/20 p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500 font-['Inter']">
          <h2 className="text-xl font-semibold mb-6 text-[#FFFFFF] text-center font-['Orbitron']">
            {isLogin ? 'Acesso Restrito' : 'Registo de Corretor'}
          </h2>
          
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
          {success && <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-3 rounded-lg mb-4 text-sm text-center">{success}</div>}
          
          <div className="space-y-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#8D99AE]" />
              </div>
              <input 
                type="email" 
                placeholder="E-mail corporativo" 
                required 
                // Inputs no padrão Maggia
                className="w-full pl-10 pr-4 py-3 bg-[#050508] border border-[#8D99AE]/30 rounded-xl text-[#FFFFFF] placeholder-[#8D99AE] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#8D99AE]" />
              </div>
              <input 
                type="password" 
                placeholder="Palavra-passe" 
                required 
                minLength="6"
                className="w-full pl-10 pr-4 py-3 bg-[#050508] border border-[#8D99AE]/30 rounded-xl text-[#FFFFFF] placeholder-[#8D99AE] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            {!isLogin && (
              <div className="relative animate-in fade-in zoom-in duration-300">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Cor Dourado Metálico #D4AF37 para o ícone da chave */}
                  <Key className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <input 
                  type="text" 
                  placeholder="Código de Autorização" 
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 bg-[#050508] border border-[#D4AF37]/50 rounded-xl text-[#FFFFFF] placeholder-[#8D99AE] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value)} 
                />
              </div>
            )}
          </div>
          
          {/* Botão CTA Ciano Holográfico #00E5FF */}
          <button type="submit" disabled={loading} className="w-full bg-[#00E5FF] hover:bg-[#00C2D6] text-[#050508] py-3 rounded-xl font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all flex justify-center items-center gap-2">
            {loading ? 'A processar...' : (isLogin ? <><LogIn size={18} /> Autenticar</> : <><UserPlus size={18} /> Criar Conta</>)}
          </button>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }} 
              className="text-sm text-[#8D99AE] hover:text-[#FFFFFF] transition-colors"
            >
              {isLogin ? 'Sem acesso? Solicite uma conta aqui.' : 'Já tem acesso? Inicie sessão.'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-8 text-[#8D99AE] text-xs">
          &copy; {new Date().getFullYear()} Maggia SaaS. <br/> A Maggia por trás do seu negócio.
        </div>
      </div>
    </div>
  );
}