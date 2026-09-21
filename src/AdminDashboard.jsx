import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Flame, Snowflake, Search, RefreshCw, MessageSquare } from 'lucide-react';

// Inicializa a ligação ao Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPesquisa, setFiltroPesquisa] = useState('');
  
  // Novo Estado para o Tema
  const [temaAtivo, setTemaAtivo] = useState('maggia');

  // Dicionário de Cores Dinâmicas
  const temas = {
    maggia: {
      fundo: 'bg-[#0B0F19]',
      textoBase: 'text-gray-200',
      titulo: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500',
      subtitulo: 'text-gray-400',
      botaoRefresh: 'bg-gray-800 hover:bg-gray-700 text-cyan-400 border-cyan-500/30',
      card: 'bg-gray-800/50 border-gray-700/50',
      cardHover: 'hover:bg-gray-700/30',
      inputBg: 'bg-gray-900 border-gray-600 text-white focus:border-cyan-500 focus:ring-cyan-500',
      tableHeader: 'bg-gray-900/80 border-gray-700 text-gray-300',
      textoDestaque: 'text-white',
      textoSecundario: 'text-gray-400',
      textoEspecial: 'text-cyan-400',
      textoAmarelo: 'text-yellow-500',
      badgeFrio: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      badgeQuente: 'bg-red-500/10 text-red-500 border-red-500/20',
      iconFrio: 'bg-cyan-500/20 text-cyan-400',
      iconQuente: 'bg-red-500/20 text-red-500',
      iconTotal: 'bg-blue-500/20 text-blue-400',
      divisor: 'divide-gray-700/50'
    },
    honda: {
      fundo: 'bg-gray-100',
      textoBase: 'text-gray-800',
      titulo: 'text-red-700',
      subtitulo: 'text-gray-600',
      botaoRefresh: 'bg-white hover:bg-gray-50 text-red-600 border-red-200 shadow-sm',
      card: 'bg-white border-gray-200 shadow-sm',
      cardHover: 'hover:bg-gray-50',
      inputBg: 'bg-white border-gray-300 text-gray-900 focus:border-red-500 focus:ring-red-500',
      tableHeader: 'bg-gray-50 border-gray-200 text-gray-600',
      textoDestaque: 'text-gray-900',
      textoSecundario: 'text-gray-500',
      textoEspecial: 'text-red-600',
      textoAmarelo: 'text-gray-700',
      badgeFrio: 'bg-gray-100 text-gray-600 border-gray-200',
      badgeQuente: 'bg-red-100 text-red-700 border-red-200',
      iconFrio: 'bg-gray-100 text-gray-500',
      iconQuente: 'bg-red-100 text-red-600',
      iconTotal: 'bg-red-50 text-red-500',
      divisor: 'divide-gray-200'
    },
    porto: {
      fundo: 'bg-slate-50',
      textoBase: 'text-slate-800',
      titulo: 'text-blue-700',
      subtitulo: 'text-slate-600',
      botaoRefresh: 'bg-white hover:bg-slate-50 text-blue-600 border-blue-200 shadow-sm',
      card: 'bg-white border-slate-200 shadow-sm',
      cardHover: 'hover:bg-slate-50',
      inputBg: 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500',
      tableHeader: 'bg-slate-100 border-slate-200 text-slate-600',
      textoDestaque: 'text-slate-900',
      textoSecundario: 'text-slate-500',
      textoEspecial: 'text-blue-600',
      textoAmarelo: 'text-slate-700',
      badgeFrio: 'bg-slate-100 text-slate-600 border-slate-200',
      badgeQuente: 'bg-blue-100 text-blue-700 border-blue-200',
      iconFrio: 'bg-slate-100 text-slate-500',
      iconQuente: 'bg-blue-100 text-blue-600',
      iconTotal: 'bg-blue-50 text-blue-500',
      divisor: 'divide-slate-200'
    },
    premium: {
      fundo: 'bg-zinc-950',
      textoBase: 'text-zinc-200',
      titulo: 'text-[#D4AF37]',
      subtitulo: 'text-zinc-400',
      botaoRefresh: 'bg-zinc-900 hover:bg-zinc-800 text-[#D4AF37] border-[#D4AF37]/30',
      card: 'bg-zinc-900 border-[#D4AF37]/20 shadow-lg',
      cardHover: 'hover:bg-zinc-800/50',
      inputBg: 'bg-zinc-900 border-zinc-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]',
      tableHeader: 'bg-zinc-900/80 border-zinc-800 text-zinc-300',
      textoDestaque: 'text-white',
      textoSecundario: 'text-zinc-400',
      textoEspecial: 'text-[#D4AF37]',
      textoAmarelo: 'text-amber-500',
      badgeFrio: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      badgeQuente: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30',
      iconFrio: 'bg-zinc-800 text-zinc-400',
      iconQuente: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      iconTotal: 'bg-zinc-800 text-[#D4AF37]',
      divisor: 'divide-zinc-800'
    }
  };

  const t = temas[temaAtivo];

  const carregarLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads_consorcio')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLeads();
  }, []);

  const leadsFiltrados = leads.filter(lead => 
    lead.nome?.toLowerCase().includes(filtroPesquisa.toLowerCase()) ||
    lead.telefone?.includes(filtroPesquisa)
  );

  const totalLeads = leads.length;
  const leadsQuentes = leads.filter(l => l.status === 'QUENTE').length;
  const leadsFrios = leads.filter(l => l.status === 'FRIO').length;

  return (
    <div className={`min-h-screen p-6 font-sans transition-colors duration-300 ${t.fundo} ${t.textoBase}`}>
      
      {/* Seletor de Temas (Nova Inclusão) */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setTemaAtivo('maggia')} className="px-3 py-1 text-xs rounded bg-[#0B0F19] text-cyan-400 border border-cyan-500/30">Maggia</button>
        <button onClick={() => setTemaAtivo('honda')} className="px-3 py-1 text-xs rounded bg-red-600 text-white">Honda</button>
        <button onClick={() => setTemaAtivo('porto')} className="px-3 py-1 text-xs rounded bg-blue-600 text-white">Porto</button>
        <button onClick={() => setTemaAtivo('premium')} className="px-3 py-1 text-xs rounded bg-zinc-950 text-[#D4AF37] border border-[#D4AF37]/50">Premium</button>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${t.titulo}`}>
            Painel de Comando SDR
          </h1>
          <p className={`mt-1 ${t.subtitulo}`}>Gestão de Leads Qualificados por Inteligência Artificial</p>
        </div>
        
        <button 
          onClick={carregarLeads}
          className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${t.botaoRefresh}`}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`border p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm transition-colors duration-300 ${t.card}`}>
          <div className={`p-3 rounded-lg ${t.iconTotal}`}>
            <Users size={28} />
          </div>
          <div>
            <p className={`text-sm ${t.subtitulo}`}>Total de Leads Triados</p>
            <p className={`text-3xl font-bold ${t.textoDestaque}`}>{totalLeads}</p>
          </div>
        </div>

        <div className={`border p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm transition-colors duration-300 ${t.card}`}>
          <div className={`p-3 rounded-lg ${t.iconQuente}`}>
            <Flame size={28} />
          </div>
          <div>
            <p className={`text-sm ${t.subtitulo}`}>Leads QUENTES (Prontos)</p>
            <p className={`text-3xl font-bold ${t.textoDestaque}`}>{leadsQuentes}</p>
          </div>
        </div>

        <div className={`border p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm transition-colors duration-300 ${t.card}`}>
          <div className={`p-3 rounded-lg ${t.iconFrio}`}>
            <Snowflake size={28} />
          </div>
          <div>
            <p className={`text-sm ${t.subtitulo}`}>Leads FRIOS (Nutrição)</p>
            <p className={`text-3xl font-bold ${t.textoDestaque}`}>{leadsFrios}</p>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className={`border rounded-xl p-4 mb-6 backdrop-blur-sm transition-colors duration-300 ${t.card}`}>
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${t.subtitulo}`} size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou telefone..." 
            value={filtroPesquisa}
            onChange={(e) => setFiltroPesquisa(e.target.value)}
            className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 transition-all ${t.inputBg}`}
          />
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className={`border rounded-xl overflow-hidden backdrop-blur-sm transition-colors duration-300 ${t.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-sm uppercase tracking-wider ${t.tableHeader}`}>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Objetivo / Carta</th>
                <th className="p-4 font-medium">Financeiro</th>
                <th className="p-4 font-medium">Análise da IA</th>
                <th className="p-4 font-medium text-center">Ação</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divisor}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className={`p-8 text-center ${t.subtitulo}`}>
                    A carregar dados do cérebro da IA...
                  </td>
                </tr>
              ) : leadsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`p-8 text-center ${t.subtitulo}`}>
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                leadsFiltrados.map((lead) => (
                  <tr key={lead.id} className={`transition-colors ${t.cardHover}`}>
                    <td className="p-4">
                      {lead.status === 'QUENTE' ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${t.badgeQuente}`}>
                          <Flame size={14} /> Quente
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${t.badgeFrio}`}>
                          <Snowflake size={14} /> Frio
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className={`font-semibold ${t.textoDestaque}`}>{lead.nome}</p>
                      <p className={`text-xs ${t.textoSecundario}`}>{lead.telefone}</p>
                    </td>
                    <td className="p-4">
                      <p className={`font-medium ${t.textoEspecial}`}>{lead.objetivo}</p>
                      <p className={`text-sm ${t.textoSecundario}`}>Crédito: {lead.valor_carta}</p>
                    </td>
                    <td className="p-4">
                      <p className={`text-sm ${t.textoSecundario}`}>Parcela: <span className={t.textoAmarelo}>{lead.parcela_ideal}</span></p>
                      <p className={`text-sm ${t.textoSecundario}`}>Lance: {lead.tem_lance}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className={`text-sm truncate hover:whitespace-normal hover:p-2 hover:rounded hover:absolute hover:z-10 hover:shadow-xl hover:max-w-md transition-all cursor-help ${t.textoSecundario} ${t.fundo}`} title={lead.feedback}>
                        {lead.feedback}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <a 
                        href={`https://wa.me/${lead.telefone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white transition-all border border-green-600/30"
                        title="Chamar no WhatsApp"
                      >
                        <MessageSquare size={18} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}