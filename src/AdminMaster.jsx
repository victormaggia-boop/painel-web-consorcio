import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Key, Plus, Copy, Check, Star, ShieldAlert } from 'lucide-react';

export default function AdminMaster() {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    fetchCodigos();
  }, []);

  const fetchCodigos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('codigos_acesso')
      .select('*')
      .order('criado_em', { ascending: false });
      
    if (!error && data) {
      setCodigos(data);
    }
    setLoading(false);
  };

  const gerarNovoCodigo = async (plano) => {
    setGerando(true);
    // Gera um sufixo aleatório de 5 caracteres
    const aleatorio = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefixo = plano === 'Pro' ? 'MAGGIA-PRO-' : 'MAGGIA-ESS-';
    const novoCodigo = prefixo + aleatorio;

    const { error } = await supabase
      .from('codigos_acesso')
      .insert([{ codigo: novoCodigo, plano }]);

    if (!error) {
      fetchCodigos();
    } else {
      alert("Erro ao gerar código: " + error.message);
    }
    setGerando(false);
  };

  const copiarParaAreaDeTransferencia = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] p-8 font-sans selection:bg-[#00E5FF] selection:text-[#050508]">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho Admin */}
        <div className="flex items-center gap-4 mb-10 border-b border-[#8D99AE]/20 pb-6">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF] font-['Orbitron']">
              Maggia <span className="text-red-500">Master Admin</span>
            </h1>
            <p className="text-[#8D99AE] text-sm font-['Inter']">Gestão de Licenças e Códigos de Acesso</p>
          </div>
        </div>

        {/* Controlos de Geração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => gerarNovoCodigo('Essencial')}
            disabled={gerando}
            className="bg-[#0B192C]/80 backdrop-blur-md border border-[#8D99AE]/30 p-6 rounded-2xl flex items-center justify-between hover:border-[#00E5FF]/50 transition-all group"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-[#FFFFFF] font-['Orbitron'] mb-1">Gerar Código Essencial</h3>
              <p className="text-[#8D99AE] text-xs">Ideal para testes e corretores independentes.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050508] border border-[#8D99AE]/30 flex items-center justify-center text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-[#050508] transition-colors">
              <Plus size={20} />
            </div>
          </button>

          <button 
            onClick={() => gerarNovoCodigo('Pro')}
            disabled={gerando}
            className="bg-[#0B192C]/80 backdrop-blur-md border border-[#D4AF37]/50 p-6 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-[#FFFFFF] font-['Orbitron']">Gerar Código Pro</h3>
                <Star size={14} className="text-[#D4AF37]" />
              </div>
              <p className="text-[#8D99AE] text-xs">Acesso total. Escala e volume elevado.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050508] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#050508] transition-colors">
              <Plus size={20} />
            </div>
          </button>
        </div>

        {/* Tabela de Códigos */}
        <div className="bg-[#0B192C]/50 backdrop-blur-xl border border-[#8D99AE]/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-[#8D99AE]/20">
            <h2 className="text-lg font-bold text-[#FFFFFF] font-['Orbitron'] flex items-center gap-2">
              <Key size={18} className="text-[#00E5FF]" /> Códigos Emitidos
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#050508]/50 text-[#8D99AE] text-xs uppercase tracking-wider font-semibold font-['Inter']">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Data de Criação</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8D99AE]/10 text-sm font-['Inter']">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-[#8D99AE]">A carregar dados...</td></tr>
                ) : codigos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-[#8D99AE]">Nenhum código gerado ainda.</td></tr>
                ) : (
                  codigos.map((c) => (
                    <tr key={c.id} className="hover:bg-[#050508]/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#FFFFFF]">{c.codigo}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${c.plano === 'Pro' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'}`}>
                          {c.plano}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.usado ? (
                          <span className="text-red-400 flex items-center gap-1"><Check size={14}/> Utilizado</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">Disponível</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#8D99AE]">
                        {new Date(c.criado_em).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => copiarParaAreaDeTransferencia(c.codigo)}
                          className="p-2 bg-[#050508] border border-[#8D99AE]/30 rounded-lg text-[#8D99AE] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-all"
                          title="Copiar Código"
                        >
                          {copiado === c.codigo ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}