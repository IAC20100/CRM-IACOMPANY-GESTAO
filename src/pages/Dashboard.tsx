import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertCircle, CheckCircle2, Plus, ArrowRight, Clock, Hammer, ShieldAlert } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export default function Dashboard() {
  const { clients, tickets, companyLogo } = useStore();
  
  const preventivas = tickets.filter(t => t.type === 'PREVENTIVA').length;
  const corretivas = tickets.filter(t => t.type === 'CORRETIVA').length;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter mb-2">Olá, Técnico</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold">Resumo operacional de hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
        </div>
        {companyLogo && (
          <div className="h-16 w-auto flex items-center bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <img src={companyLogo} alt="Logo da Empresa" className="h-full w-auto object-contain max-w-[200px]" />
          </div>
        )}
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <StatCard 
          title="CORRETIVAS ATIVAS" 
          value={corretivas} 
          icon={ShieldAlert} 
          color="red" 
          subtitle="ALTA PRIORIDADE"
        />
        <StatCard 
          title="PREVENTIVAS PENDENTES" 
          value={preventivas} 
          icon={Clock} 
          color="blue" 
          subtitle="PRAZO: 48H"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-16">
        <Link to="/tickets/new" className="btn-primary flex-1 py-6">
          <Plus className="w-6 h-6" />
          <span>NOVA ORDEM CORRETIVA</span>
        </Link>
        <button className="flex-1 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-black dark:text-white font-black text-xs uppercase tracking-widest py-6 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 card-shadow hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <FileText className="w-6 h-6 text-zinc-400" />
          <span>NOVO CHECKLIST</span>
        </button>
      </div>

      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tighter">Atividades Recentes</h2>
          <Link to="/tickets" className="text-black dark:text-white font-black text-[10px] uppercase tracking-[0.2em] hover:underline">Ver todas</Link>
        </div>

        <div className="space-y-4">
          {tickets.slice().reverse().slice(0, 5).map(ticket => {
            const client = clients.find(c => c.id === ticket.clientId);
            return (
              <div key={ticket.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 card-shadow flex items-center gap-6 transition-all hover:translate-x-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ticket.type === 'CORRETIVA' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                  <Hammer className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-black dark:text-white leading-tight">{ticket.title || `Manutenção ${ticket.type}`}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold">{client?.name || 'Local não especificado'}</p>
                </div>
                <div className={`badge ${
                  ticket.status === 'CONCLUIDO' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 
                  ticket.status === 'REALIZANDO' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800' : 
                  'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 border-zinc-100 dark:border-zinc-700'
                }`}>
                  {ticket.status === 'CONCLUIDO' ? 'CONCLUÍDO' : 
                   ticket.status === 'REALIZANDO' ? 'EM ANDAMENTO' : 
                   'AGUARDANDO'}
                </div>
              </div>
            );
          })}
          
          {tickets.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 card-shadow text-center">
              <p className="text-zinc-400 dark:text-zinc-500 font-black uppercase text-[10px] tracking-widest">Nenhuma atividade registrada ainda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Asset Map Placeholder */}
      <div className="mt-16 relative h-64 rounded-[2.5rem] overflow-hidden card-shadow border border-zinc-100 dark:border-zinc-800">
        <img 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200" 
          alt="Mapa" 
          className="w-full h-full object-cover opacity-40 grayscale dark:opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-10">
          <h3 className="text-2xl font-black text-white tracking-tighter">Mapa de Ativos</h3>
          <p className="text-zinc-300 font-bold text-sm">24 equipamentos monitorados</p>
        </div>
      </div>
    </div>
  );
}
