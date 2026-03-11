import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, TicketType } from '../store';
import { ArrowLeft } from 'lucide-react';

export default function TicketForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients, checklistItems, addTicket, updateTicket, tickets } = useStore();
  
  const [type, setType] = useState<TicketType>('CORRETIVA');
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [technician, setTechnician] = useState('');
  const [observations, setObservations] = useState('');
  
  // Corretiva
  const [reportedProblem, setReportedProblem] = useState('');
  const [productsForQuote, setProductsForQuote] = useState('');
  const [serviceReport, setServiceReport] = useState('');
  
  // Preventiva
  const [checklistResults, setChecklistResults] = useState<Record<string, { status: 'OK' | 'NOK' | 'NA', notes: string }>>(
    checklistItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'OK', notes: '' }
    }), {})
  );

  useEffect(() => {
    if (id) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setType(ticket.type);
        setClientId(ticket.clientId);
        setDate(ticket.date);
        setTechnician(ticket.technician);
        setObservations(ticket.observations);
        
        if (ticket.type === 'CORRETIVA') {
          setReportedProblem(ticket.reportedProblem || '');
          setProductsForQuote(ticket.productsForQuote || '');
          setServiceReport(ticket.serviceReport || '');
        } else if (ticket.type === 'PREVENTIVA' && ticket.checklistResults) {
          const results = ticket.checklistResults.reduce((acc, result) => ({
            ...acc,
            [result.taskId]: { status: result.status, notes: result.notes }
          }), {});
          // Merge with default items in case new items were added
          setChecklistResults(prev => ({ ...prev, ...results }));
        }
      }
    }
  }, [id, tickets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      alert('Selecione um cliente');
      return;
    }

    const ticketData = {
      type,
      clientId,
      date,
      technician,
      observations,
      ...(type === 'CORRETIVA' ? {
        reportedProblem,
        productsForQuote,
        serviceReport
      } : {
        checklistResults: Object.entries(checklistResults).map(([taskId, data]: [string, any]) => ({
          taskId,
          status: data.status,
          notes: data.notes
        }))
      })
    };

    if (id) {
      updateTicket(id, ticketData);
    } else {
      addTicket(ticketData);
    }
    navigate('/tickets');
  };

  // Filter checklist items based on selected client
  const filteredChecklistItems = checklistItems.filter(item => {
    const itemClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
    return itemClientIds.length === 0 || itemClientIds.includes(clientId);
  });

  const categories = Array.from(new Set(filteredChecklistItems.map(item => item.category)));

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="flex items-center gap-6 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-zinc-800 card-shadow active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Operações</p>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
            {id ? 'Editar O.S.' : 'Nova O.S.'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] card-shadow border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 space-y-12">
        {/* Informações Básicas */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Informações Básicas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Tipo de Ordem de Serviço</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as TicketType)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium appearance-none"
              >
                <option value="CORRETIVA">Manutenção Corretiva</option>
                <option value="PREVENTIVA">Manutenção Preventiva</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Cliente / Condomínio</label>
              <select 
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium appearance-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Data</label>
              <input 
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Técnico Responsável</label>
              <input 
                required
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="Nome do técnico"
              />
            </div>
          </div>
        </div>

        {/* Campos Específicos */}
        {type === 'CORRETIVA' ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Detalhes da Corretiva</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Problema Relatado</label>
              <textarea 
                required
                value={reportedProblem}
                onChange={(e) => setReportedProblem(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Produtos para Orçamento</label>
              <textarea 
                value={productsForQuote}
                onChange={(e) => setProductsForQuote(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium min-h-[120px]"
                placeholder="Liste os produtos necessários, se houver"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Relato da Ordem de Serviço</label>
              <textarea 
                required
                value={serviceReport}
                onChange={(e) => setServiceReport(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium min-h-[120px]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Checklist do Prédio</h2>
            </div>
            
            <div className="space-y-12">
              {categories.map(category => (
                <div key={category} className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">{category}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredChecklistItems.filter(item => item.category === category).map(item => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
                        <div className="flex-1 font-bold text-zinc-900 dark:text-zinc-100">{item.task}</div>
                        <div className="flex items-center gap-4">
                          <select 
                            value={checklistResults[item.id]?.status || 'OK'}
                            onChange={(e) => setChecklistResults(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], status: e.target.value as any }
                            }))}
                            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none transition-all border-2 ${
                              checklistResults[item.id]?.status === 'OK' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' :
                              checklistResults[item.id]?.status === 'NOK' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50' :
                              'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            <option value="OK">OK</option>
                            <option value="NOK">Não OK</option>
                            <option value="NA">N/A</option>
                          </select>
                          <input 
                            type="text"
                            placeholder="Observações..."
                            value={checklistResults[item.id]?.notes || ''}
                            onChange={(e) => setChecklistResults(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], notes: e.target.value }
                            }))}
                            className="bg-white dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-xl px-4 py-2 text-sm outline-none transition-all w-full md:w-64"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Observações Gerais</label>
          <textarea 
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 dark:text-white rounded-2xl px-6 py-4 outline-none transition-all font-medium min-h-[120px]"
          />
        </div>

        <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-6">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 card-shadow"
          >
            Salvar Ordem de Serviço
          </button>
        </div>
      </form>
    </div>
  );
}
