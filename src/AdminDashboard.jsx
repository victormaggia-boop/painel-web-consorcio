import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, Flame, Snowflake, Search, RefreshCw, MessageSquare, Trophy, XCircle, BarChart2, List, DollarSign, Settings, Save, LogOut, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Recebemos a "session" que vem do App.jsx para saber quem está logado
export default function AdminDashboard({ session }) {
  const user = session?.user;
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('gestao');
  
  const [filtroPesquisa, setFiltroPesquisa] = useState('');
  const [filtroStatusIA, setFiltroStatusIA] = useState('Todos');
  const [filtroVenda, setFiltroVenda] = useState('Todos');
  const [filtroObjetivo, setFiltroObjetivo] = useState('Todos');
  
  const [temaAtivo, setTemaAtivo] = useState('maggia');
  
  const [textoPromocoes, setTextoPromocoes] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [tomVoz, setTomVoz] = useState('');
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [modalIA, setModalIA] = useState(null);

  const temas = {
    maggia: { fundo: 'bg-[#0B0F19]', textoBase: 'text-gray-200', titulo: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500', subtitulo: 'text-gray-400', card: 'bg-gray-800/50 border-gray-700/50', inputBg: 'bg-gray-900 border-gray-600 text-white', tableHeader: 'bg-gray-900/80 border-gray-700 text-gray-300', divisor: 'divide-gray-700/50', textoSecundario: 'text-gray-400', botao: 'bg-blue-600 hover:bg-blue-700 text-white' },
    honda: { fundo: 'bg-gray-100', textoBase: 'text-gray-800', titulo: 'text-red-700', subtitulo: 'text-gray-600', card: 'bg-white border-gray-200', inputBg: 'bg-white border-gray-300 text-gray-900', tableHeader: 'bg-gray-50 border-gray-200 text-gray-600', divisor: 'divide-gray-200', textoSecundario: 'text-gray-500', botao: 'bg-red-700 hover:bg-red-800 text-white' },
    porto: { fundo: 'bg-[#004691]', textoBase: 'text-white', titulo: 'text-blue-100', subtitulo: 'text-blue-200', card: 'bg-blue-900/40 border-blue-800', inputBg: 'bg-blue-950 border-blue-700 text-white', tableHeader: 'bg-blue-950/80 border-blue-800 text-blue-100', divisor: 'divide-blue-800', textoSecundario: 'text-blue-300', botao: 'bg-blue-500 hover:bg-blue-600 text-white' },
    premium: { fundo: 'bg-zinc-950', textoBase: 'text-zinc-200', titulo: 'text-[#D4AF37]', subtitulo: 'text-zinc-400', card: 'bg-zinc-900 border-[#D4AF37]/20', inputBg: 'bg-zinc-900 border-zinc-700 text-white', tableHeader: 'bg-zinc-900/80 border-zinc-800 text-zinc-300', divisor: 'divide-zinc-800', textoSecundario: 'text-zinc-400', botao: 'bg-[#D4AF37] hover:bg-[#C5A028] text-zinc-900 font-bold' }
  };
  const t = temas[temaAtivo];

  const carregarDados = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Como o RLS está ativo, o supabase só vai trazer os leads deste utilizador
      const { data: leadsData } = await supabase.from('leads_consorcio').select('*').order('criado_em', { ascending: false });
      if (leadsData) setLeads(leadsData);

      const { data: configData } = await supabase.from('configuracoes_bot').select('*').eq('user_id', user.id).single();
      if (configData) {
        setTextoPromocoes(configData.promocoes || '');
        setNomeEmpresa(configData.nome_empresa || '');
        setTomVoz(configData.tom_voz || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const atualizarEtapaVenda = async (id, novaEtapa) => {
    setLeads(leadsAtuais => leadsAtuais.map(lead => lead.id === id ? { ...lead, etapa_venda: novaEtapa } : lead));
    await supabase.from('leads_consorcio').update({ etapa_venda: novaEtapa }).eq('id', id);
  };

  const salvarConfiguracoesIA = async () => {
    setSalvandoConfig(true);
    try {
      // Usamos upsert para criar ou atualizar as configurações deste utilizador
      const { error } = await supabase.from('configuracoes_bot').upsert({ 
        user_id: user.id, // Amarra as configurações ao dono da conta
        promocoes: textoPromocoes, 
        nome_empresa: nomeEmpresa, 
        tom_voz: tomVoz 
      }, { onConflict: 'user_id' }); // Se já existir para este user, atualiza
      
      if (error) throw error;
      alert("Configurações guardadas! O painel e o robô foram atualizados.");
    } catch (error) {
      console.error(error);
      alert("Erro ao guardar as configurações.");
    } finally {
      setSalvandoConfig(false);
    }
  };

  const extrairValorFinanceiro = (texto) => {
    if (!texto) return 0;
    let numStr = texto.toLowerCase().replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
    if (!numStr) return 0;
    let valor = parseFloat(numStr);
    if (valor < 1000 && (texto.includes('mil') || texto.includes('k'))) valor *= 1000;
    return valor;
  };

  const leadsFiltrados = leads.filter(lead => {
    const busca = filtroPesquisa.toLowerCase();
    const matchPesquisa = lead.nome?.toLowerCase().includes(busca) || lead.telefone?.includes(busca);
    const matchIA = filtroStatusIA === 'Todos' || lead.status === filtroStatusIA;
    const etapaAtual = lead.etapa_venda || 'Em Andamento';
    const matchVenda = filtroVenda === 'Todos' || etapaAtual === filtroVenda;
    const objetivoLead = lead.objetivo ? lead.objetivo.toLowerCase() : '';
    const matchObjetivo = filtroObjetivo === 'Todos' || objetivoLead.includes(filtroObjetivo.toLowerCase());
    return matchPesquisa && matchIA && matchVenda && matchObjetivo;
  });

  const leadsFechados = leads.filter(l => l.etapa_venda === 'Venda Fechada');
  const valorTotalFechado = leadsFechados.reduce((acc, lead) => acc + extrairValorFinanceiro(lead.valor_carta), 0);
  const valorFormatado = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valorTotalFechado);

  const dadosGraficoFunil = [
    { name: 'Em Andamento', value: leads.filter(l => !l.etapa_venda || l.etapa_venda === 'Em Andamento').length, color: '#3b82f6' },
    { name: 'Ganhos', value: leadsFechados.length, color: '#10b981' },
    { name: 'Perdidos', value: leads.filter(l => l.etapa_venda === 'Perdido').length, color: '#ef4444' }
  ];

  // Gera a inicial para o "Logotipo"
  const inicialEmpresa = nomeEmpresa ? nomeEmpresa.charAt(0).toUpperCase() : <Building2 size={24} />;

  return (
    <div className={`min-h-screen p-6 font-sans transition-colors duration-300 ${t.fundo} ${t.textoBase}`}>
      
      {/* Top Bar - Temas e Logout */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-500/20 pb-4">
        <div className="flex gap-2">
          {Object.keys(temas).map(tema => (
            <button key={tema} onClick={() => setTemaAtivo(tema)} className="px-3 py-1 text-xs rounded border border-gray-500/30 uppercase cursor-pointer hover:scale-105 transition">{tema}</button>
          ))}
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 text-red-500 border border-red-500/30 rounded hover:bg-red-500 hover:text-white transition">
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>

      {/* Header Personalizado do Cliente */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 bg-black/10 p-6 rounded-2xl border border-gray-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Avatar/Logo da Empresa */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-white/10">
            {inicialEmpresa}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${t.titulo}`}>
              {nomeEmpresa ? nomeEmpresa : 'Painel SDR'}
            </h1>
            <p className={`mt-1 flex items-center gap-2 ${t.subtitulo}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SDR Inteligente Conectado | {user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-6 xl:mt-0">
          <button onClick={() => setAbaAtiva('gestao')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${abaAtiva === 'gestao' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30' : 'bg-transparent border border-gray-500/30'}`}><List size={18} /> Gestão</button>
          <button onClick={() => setAbaAtiva('relatorios')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${abaAtiva === 'relatorios' ? 'bg-purple-600/20 text-purple-500 border border-purple-500/30' : 'bg-transparent border border-gray-500/30'}`}><BarChart2 size={18} /> Relatórios</button>
          <button onClick={() => setAbaAtiva('configuracoes')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${abaAtiva === 'configuracoes' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'bg-transparent border border-gray-500/30'}`}><Settings size={18} /> Configurações</button>
        </div>
      </div>

      {/* --- ABA DE GESTÃO --- */}
      {abaAtiva === 'gestao' && (
        <>
          <div className={`border rounded-xl p-4 mb-6 backdrop-blur-sm grid grid-cols-1 md:grid-cols-5 gap-4 ${t.card}`}>
            <div className="relative md:col-span-2">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${t.subtitulo}`} size={18} />
              <input type="text" placeholder="Pesquisar..." value={filtroPesquisa} onChange={(e) => setFiltroPesquisa(e.target.value)} className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none transition-all ${t.inputBg}`} />
            </div>
            <select value={filtroObjetivo} onChange={(e) => setFiltroObjetivo(e.target.value)} className={`border rounded-lg px-4 py-2 focus:outline-none transition-all ${t.inputBg}`}>
              <option value="Todos">Interesse: Todos</option>
              <option value="imovel">Imóveis</option>
              <option value="casa">Casas</option>
              <option value="carro">Carros</option>
              <option value="moto">Motos</option>
              <option value="caminhao">Caminhões</option>
            </select>
            <select value={filtroStatusIA} onChange={(e) => setFiltroStatusIA(e.target.value)} className={`border rounded-lg px-4 py-2 focus:outline-none transition-all ${t.inputBg}`}>
              <option value="Todos">Status IA: Todos</option>
              <option value="QUENTE">QUENTES</option>
              <option value="FRIO">FRIOS</option>
            </select>
            <select value={filtroVenda} onChange={(e) => setFiltroVenda(e.target.value)} className={`border rounded-lg px-4 py-2 focus:outline-none transition-all ${t.inputBg}`}>
              <option value="Todos">Funil: Todos</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Venda Fechada">Fechadas</option>
              <option value="Perdido">Perdidos</option>
            </select>
          </div>

          <div className={`border rounded-xl overflow-hidden backdrop-blur-sm ${t.card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className={`border-b text-sm uppercase tracking-wider ${t.tableHeader}`}>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Cliente</th>
                    <th className="p-4 font-medium">Interesse</th>
                    <th className="p-4 font-medium">Parecer da IA</th>
                    <th className="p-4 font-medium">Etapa</th>
                    <th className="p-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.divisor}`}>
                  {loading ? <tr><td colSpan="6" className={`p-8 text-center ${t.subtitulo}`}>A carregar dados seguros...</td></tr> 
                  : leadsFiltrados.length === 0 ? <tr><td colSpan="6" className={`p-8 text-center ${t.subtitulo}`}>Nenhum lead encontrado para a sua conta.</td></tr>
                  : leadsFiltrados.map((lead) => (
                    <tr key={lead.id} className="hover:bg-black/10 transition-colors">
                      <td className="p-4">
                        {lead.status === 'QUENTE' ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><Flame size={14} /> Quente</span> : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Snowflake size={14} /> Frio</span>}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{lead.nome}</p>
                        <a href={`https://wa.me/${lead.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={`text-xs text-blue-500 hover:underline ${t.textoSecundario}`}>{lead.telefone}</a>
                      </td>
                      <td className="p-4">
                        <p className="font-medium capitalize">{lead.objetivo || 'Não definido'} - {lead.valor_carta}</p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => setModalIA(lead)} className={`flex items-center gap-2 text-xs bg-purple-500/10 text-purple-500 border border-purple-500/30 px-3 py-1.5 rounded hover:bg-purple-500 hover:text-white transition-all`}>
                          <MessageSquare size={14} /> Ver Análise
                        </button>
                      </td>
                      <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${!lead.etapa_venda || lead.etapa_venda === 'Em Andamento' ? 'bg-blue-500/20 text-blue-500' : lead.etapa_venda === 'Venda Fechada' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{lead.etapa_venda || 'Em Andamento'}</span></td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => atualizarEtapaVenda(lead.id, 'Venda Fechada')} className="p-2 bg-green-600/20 text-green-500 rounded hover:bg-green-600 hover:text-white" title="Ganho"><Trophy size={16} /></button>
                          <button onClick={() => atualizarEtapaVenda(lead.id, 'Perdido')} className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white" title="Perdido"><XCircle size={16} /></button>
                          <button onClick={() => atualizarEtapaVenda(lead.id, 'Em Andamento')} className="p-2 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600 hover:text-white" title="Retomar"><RefreshCw size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* --- ABA DE RELATÓRIOS --- */}
      {abaAtiva === 'relatorios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`border rounded-xl p-6 ${t.card}`}><h3 className={`text-lg font-bold mb-4 ${t.titulo}`}>Conversão Geral</h3><div className="h-64"><ResponsiveContainer><PieChart><Pie data={dadosGraficoFunil} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{dadosGraficoFunil.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} /></PieChart></ResponsiveContainer></div></div>
          <div className={`border rounded-xl p-6 flex flex-col justify-center items-center text-center ${t.card}`}><div className="p-4 bg-emerald-500/10 rounded-full mb-4"><DollarSign size={40} className="text-emerald-500" /></div><h3 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 mb-2`}>{valorFormatado}</h3><p className={`text-sm font-medium ${t.subtitulo}`}>Volume Total Negociado ({leadsFechados.length} {leadsFechados.length === 1 ? 'venda' : 'vendas'})</p></div>
        </div>
      )}

      {/* --- ABA DE CONFIGURAÇÕES --- */}
      {abaAtiva === 'configuracoes' && (
        <div className={`max-w-4xl border rounded-xl p-6 ${t.card}`}>
          <h2 className={`text-2xl font-bold mb-2 ${t.titulo}`}>Aparência e Treinamento da IA</h2>
          <p className={`mb-8 ${t.subtitulo}`}>Configure os dados da sua empresa e o comportamento do seu SDR no WhatsApp.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${t.textoBase}`}>Nome da sua Empresa (Aparece no Topo)</label>
              <input type="text" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} placeholder="Ex: Consórcio Maggia" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${t.inputBg}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${t.textoBase}`}>Tom de Voz do Robô</label>
              <select value={tomVoz} onChange={(e) => setTomVoz(e.target.value)} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${t.inputBg}`}>
                <option value="Profissional e consultivo">Profissional e Direto (Ideal para alto padrão)</option>
                <option value="Jovem, descontraído e usa emojis">Jovem e Descontraído (Com emojis)</option>
                <option value="Acolhedor, paciente e focado em tirar dúvidas">Acolhedor e Consultivo</option>
                <option value="Persuasivo, vendedor agressivo">Persuasivo (Focado em fechar rápido)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${t.textoBase}`}>Promoções e Avisos Atuais (Contexto Dinâmico)</label>
            <textarea value={textoPromocoes} onChange={(e) => setTextoPromocoes(e.target.value)} placeholder="Digite aqui o que a IA precisa saber hoje..." className={`w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${t.inputBg}`} />
          </div>
          
          <button onClick={salvarConfiguracoesIA} disabled={salvandoConfig} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${t.botao} ${salvandoConfig ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Save size={20} /> {salvandoConfig ? 'A guardar...' : 'Guardar Alterações da IA'}
          </button>
        </div>
      )}

      {/* --- Modal do Parecer da IA --- */}
      {modalIA && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] ${t.card} bg-opacity-100 bg-[#0B0F19]`}>
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center rounded-t-xl">
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${t.titulo}`}>
                  <MessageSquare className="text-purple-400" />
                  Parecer do SDR (IA)
                </h3>
                <p className={`text-sm mt-1 ${t.textoSecundario}`}>Análise da conversa com <strong className={t.textoBase}>{modalIA.nome}</strong></p>
              </div>
              <button onClick={() => setModalIA(null)} className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-red-500 p-2 rounded-lg transition-all">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className={`border p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${t.inputBg}`}>
                {modalIA.feedback ? modalIA.feedback : <span className="italic text-gray-500">O robô não deixou nenhum parecer para este lead.</span>}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700/50 rounded-b-xl flex justify-end">
              <button onClick={() => setModalIA(null)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all">
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}