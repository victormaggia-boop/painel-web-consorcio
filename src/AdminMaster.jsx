import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Key, Plus, Copy, Check, Star, ShieldAlert, Users, Power } from 'lucide-react';

export default function AdminMaster() {
  const [codigos, setCodigos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    // Busca os códigos
    const resCodigos = await supabase.from('codigos_acesso').select('*').order('criado_em', { ascending: false });
    if (resCodigos.data) setCodigos(resCodigos.data);
    
    // Busca os clientes registados
    const resClientes = await supabase.from('assinaturas').select('*').order('created_at', { ascending: false });
    if (resClientes.data) setClientes(resClientes.data);
    
    setLoading(false);
  };

  const gerarNovoCodigo = async (plano) => {
    setGerando(true);
    const aleatorio = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefixo = plano === 'Pro' ? 'MAGGIA-PRO-' : 'MAGGIA-ESS-';
    
    await supabase.from('codigos_acesso').insert([{ codigo: prefixo + aleatorio, plano }]);
    fetchDados();
    setGerando(false);
  };

  const copiarParaAreaDeTransferencia = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const alternarStatusCliente = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'ativo' ? 'suspenso' : 'ativo';
    await supabase.from('assinaturas').update({ status: novoStatus }).eq('id', id);
    fetchDados();
  };

  return (
    <div className="min-h-screen bg-[#050508] p-8 font-sans selection:bg-[#00E5FF] selection:text-[#050508]">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-10 border-b border-[#8D99AE]/20 pb-6">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF] font-['Orbitron']">
              Maggia <span className="text-red-500">Master Admin</span>
            </h1>
            <p className="text-[#8D99AE] text-sm font-['Inter']">Gestão de Licenças e Clientes</p>
          </div>
        </div>

        {/* Controlos de Geração de Códigos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button onClick={() => gerarNovoCodigo('Essencial')} disabled={gerando} className="bg-[#0B192C]/80 border border-[#8D99AE]/30 p-6 rounded-2xl flex items-center justify-between hover:border-[#00E5FF]/50 transition-all group">
            <div className="text-left">
              <h3 className="text-xl font-bold text-[#FFFFFF] font-['Orbitron'] mb-1">Gerar Código Essencial</h3>
              <p className="text-[#8D99AE] text-xs">Ideal para testes e corretores independentes.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050508] border border-[#8D99AE]/30 flex items-center justify-center text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-[#050508] transition-colors"><Plus size={20} /></div>
          </button>

          <button onClick={() => gerarNovoCodigo('Pro')} disabled={gerando} className="bg-[#0B192C]/80 border border-[#D4AF37]/50 p-6 rounded-2xl flex items-center justify-between hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all group">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-[#FFFFFF] font-['Orbitron']">Gerar Código Pro</h3>
                <Star size={14} className="text-[#D4AF37]" />
              </div>
              <p className="text-[#8D99AE] text-xs">Acesso total. Escala e volume elevado.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050508] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#050508] transition-colors"><Plus size={20} /></div>
          </button>
        </div>

        {/* Layout em Duas Colunas para as Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tabela 1: Códigos Emitidos */}
          <div className="bg-[#0B192C]/50 border border-[#8D99AE]/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#8D99AE]/20">
              <h2 className="text-lg font-bold text-[#FFFFFF] font-['Orbitron'] flex items-center gap-2">
                <Key size={18} className="text-[#00E5FF]" /> Códigos Emitidos
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#050508]/50 text-[#8D99AE] text-xs uppercase font-semibold">
                    <th className="px-6 py-4">Código / Plano</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8D99AE]/10">
                  {codigos.map((c) => (
                    <tr key={c.id} className="hover:bg-[#050508]/30">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-[#FFFFFF] mb-1">{c.codigo}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.plano === 'Pro' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#00E5FF]/10 text-[#00E5FF]'}`}>{c.plano}</span>
                      </td>
                      <td className="px-6 py-4">
                        {c.usado ? <span className="text-red-400 text-xs">Utilizado</span> : <span className="text-emerald-400 text-xs">Disponível</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => copiarParaAreaDeTransferencia(c.codigo)} className="p-2 bg-[#050508] border border-[#8D99AE]/30 rounded-lg text-[#8D99AE] hover:text-[#FFFFFF] transition-all">
                          {copiado === c.codigo ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela 2: Clientes Ativos */}
          <div className="bg-[#0B192C]/50 border border-[#8D99AE]/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#8D99AE]/20">
              <h2 className="text-lg font-bold text-[#FFFFFF] font-['Orbitron'] flex items-center gap-2">
                <Users size={18} className="text-[#D4AF37]" /> Gestão de Clientes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#050508]/50 text-[#8D99AE] text-xs uppercase font-semibold">
                    <th className="px-6 py-4">Cliente (E-mail)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8D99AE]/10">
                  {clientes.length === 0 ? (
                     <tr><td colSpan="3" className="text-center py-8 text-[#8D99AE]">Nenhum cliente registado ainda.</td></tr>
                  ) : (
                    clientes.map((cli) => (
                      <tr key={cli.id} className="hover:bg-[#050508]/30">
                        <td className="px-6 py-4 text-[#FFFFFF] font-medium">{cli.email || 'Sem e-mail registado'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${cli.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {cli.status === 'ativo' ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => alternarStatusCliente(cli.id, cli.status)}
                            className={`p-2 border rounded-lg transition-all ${cli.status === 'ativo' ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                            title={cli.status === 'ativo' ? 'Suspender Cliente' : 'Reativar Cliente'}
                          >
                            <Power size={16} />
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
    </div>
  );
}