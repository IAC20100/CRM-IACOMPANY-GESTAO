import { useState } from 'react';
import { useStore, TicketStatus } from '../store';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit, Hammer, Clock, ShieldAlert, Bell, ArrowLeft } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';

export default function Tickets() {
  const { tickets, clients, deleteTicket, updateTicket } = useStore();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      updateTicket(ticketId, { ...ticket, status: newStatus });
    }
  };

  const preventivas = tickets.filter(t => t.type === 'PREVENTIVA').length;
  const corretivas = tickets.filter(t => t.type === 'CORRETIVA').length;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-6 h-6 text-black dark:text-white" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter">Tarefas Urgentes</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest text-center md:text-left">Monitoramento de chamados</p>
          </div>
        </div>
        <button className="p-3 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-black dark:hover:text-white transition-all card-shadow active:scale-95">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <div className="flex justify-center mb-12">
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-8 py-3 rounded-full border-2 border-red-100 dark:border-red-900/20 font-black text-[10px] uppercase tracking-[0.25em] shadow-sm">
          {tickets.length} ITENS PRIORITÁRIOS EM ABERTO
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <StatCard 
          title="Atendimento Corretivo" 
          value={corretivas} 
          icon={ShieldAlert} 
          color="red" 
        />
        <StatCard 
          title="Preventiva Pendente" 
          value={preventivas} 
          icon={Clock} 
          color="blue" 
        />
      </div>

      <div className="mb-16 flex justify-center md:justify-start">
        <Link to="/tickets/new" className="btn-primary group py-6 px-10">
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          <span>NOVA ORDEM CORRETIVA</span>
        </Link>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.5)]"></div>
          <h2 className="text-3xl font-black text-black dark:text-white tracking-tighter">Atividade em Tempo Real</h2>
        </div>

        <div className="space-y-6">
          {tickets.slice().reverse().map(ticket => {
            const client = clients.find(c => c.id === ticket.clientId);
            return (
              <div key={ticket.id} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow flex flex-col md:flex-row items-start md:items-center gap-8 transition-all hover:translate-x-2 relative overflow-hidden group">
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${ticket.type === 'CORRETIVA' ? 'bg-red-600' : 'bg-zinc-500 dark:bg-zinc-400'}`}></div>
                
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${ticket.type === 'CORRETIVA' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                  <Hammer className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-black dark:text-white leading-tight">{ticket.title || `Manutenção ${ticket.type}`}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      ticket.type === 'CORRETIVA' ? 'bg-red-600 text-white' : 'bg-zinc-500 text-white'
                    }`}>
                      {ticket.type === 'CORRETIVA' ? 'URGENTE' : 'ALTA'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide">{client?.name || 'Local não especificado'}</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-50 dark:border-zinc-800 pt-6 md:pt-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                    <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">Aguardando</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/tickets/${ticket.id}`} className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-2xl transition-all" title="Visualizar">
                      <Eye className="w-6 h-6" />
                    </Link>
                    <Link to={`/tickets/${ticket.id}/edit`} className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-2xl transition-all" title="Editar">
                      <Edit className="w-6 h-6" />
                    </Link>
                    <button onClick={() => setTicketToDelete(ticket.id)} className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all" title="Excluir">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {tickets.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 p-20 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-center">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200 dark:text-zinc-700">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <p className="text-zinc-400 dark:text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">Nenhum atendimento prioritário registrado.</p>
            </div>
          )}
        </div>
      </section>

      <Modal 
        isOpen={!!ticketToDelete} 
        onClose={() => setTicketToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-8">
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg leading-relaxed text-center">Tem certeza que deseja excluir este atendimento? Esta ação removerá permanentemente o registro.</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                if (ticketToDelete) deleteTicket(ticketToDelete);
                setTicketToDelete(null);
              }}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-95 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Sim, Excluir Registro
            </button>
            <button 
              onClick={() => setTicketToDelete(null)}
              className="w-full py-5 text-zinc-400 dark:text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
