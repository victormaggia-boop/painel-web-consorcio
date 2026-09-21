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

  // Função para ir buscar os leads à Base de Dados
  const carregarLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads_consorcio')
        .select('*')
        .order('criado_em', { ascending: false }); // Os mais recentes primeiro

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados assim que a página abre
  useEffect(() => {
    carregarLeads();
  }, []);

  // Filtra os leads pela barra de pesquisa (nome ou telefone)
  const leadsFiltrados = leads.filter(lead => 
    lead.nome?.toLowerCase().includes(filtroPesquisa.toLowerCase()) ||
    lead.telefone?.includes(filtroPesquisa)
  );

  // Cálculos para os Cartões de Métricas
  const totalLeads = leads.length;
  const leadsQuentes = leads.filter(l => l.status === 'QUENTE').length;
  const leadsFrios = leads.filter(l => l.status === 'FRIO').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-6 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Painel de Comando SDR
          </h1>
          <p className="text-gray-400 mt-1">Gestão de Leads Qualificados por Inteligência Artificial</p>
        </div>
        
        <button 
          onClick={carregarLeads}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Users size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total de Leads Triados</p>
            <p className="text-3xl font-bold text-white">{totalLeads}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">
            <Flame size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Leads QUENTES (Prontos)</p>
            <p className="text-3xl font-bold text-white">{leadsQuentes}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex items-center gap-4 backdrop-blur-sm">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-lg">
            <Snowflake size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Leads FRIOS (Nutrição)</p>
            <p className="text-3xl font-bold text-white">{leadsFrios}</p>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou telefone..." 
            value={filtroPesquisa}
            onChange={(e) => setFiltroPesquisa(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 border-b border-gray-700 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Objetivo / Carta</th>
                <th className="p-4 font-medium">Financeiro</th>
                <th className="p-4 font-medium">Análise da IA</th>
                <th className="p-4 font-medium text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    A carregar dados do cérebro da IA...
                  </td>
                </tr>
              ) : leadsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                leadsFiltrados.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      {lead.status === 'QUENTE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                          <Flame size={14} /> Quente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Snowflake size={14} /> Frio
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{lead.nome}</p>
                      <p className="text-xs text-gray-400">{lead.telefone}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-cyan-400 font-medium">{lead.objetivo}</p>
                      <p className="text-sm text-gray-300">Crédito: {lead.valor_carta}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-300">Parcela: <span className="text-yellow-500">{lead.parcela_ideal}</span></p>
                      <p className="text-sm text-gray-300">Lance: {lead.tem_lance}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-sm text-gray-400 truncate hover:whitespace-normal hover:bg-gray-900 hover:p-2 hover:rounded hover:absolute hover:z-10 hover:shadow-xl hover:max-w-md transition-all cursor-help" title={lead.feedback}>
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