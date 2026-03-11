import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClient(editingId, formData);
    } else {
      addClient(formData);
    }
    closeModal();
  };

  const openModal = (client?: typeof clients[0]) => {
    if (client) {
      setFormData({ 
        name: client.name, 
        document: client.document || '',
        contactPerson: client.contactPerson || '',
        phone: client.phone, 
        email: client.email || '',
        address: client.address,
        notes: client.notes || ''
      });
      setEditingId(client.id);
    } else {
      setFormData({ name: '', document: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', document: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Clientes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Gestão de condomínios e parceiros</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-6 h-6" /> 
          <span>NOVO CLIENTE</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-8">Nome / Condomínio</th>
                <th className="p-8">CNPJ/CPF</th>
                <th className="p-8">Responsável</th>
                <th className="p-8">Contato</th>
                <th className="p-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {clients.map(client => (
                <tr key={client.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-900 dark:text-white">{client.name}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold truncate max-w-[200px] mt-1">{client.address}</span>
                    </div>
                  </td>
                  <td className="p-8 text-sm text-zinc-500 dark:text-zinc-400 font-black">{client.document || '-'}</td>
                  <td className="p-8 text-sm text-zinc-500 dark:text-zinc-400 font-black">{client.contactPerson || '-'}</td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-900 dark:text-white font-black">{client.phone}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold mt-1">{client.email || '-'}</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(client)}
                        className="p-2 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setClientToDelete(client.id)}
                        className="p-2 text-zinc-300 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-black uppercase text-xs tracking-widest">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? 'Editar Cliente' : 'Novo Cliente'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Nome / Condomínio *</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
              placeholder="Ex: Condomínio das Flores"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">CNPJ / CPF</label>
              <input 
                type="text" 
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Responsável</label>
              <input 
                type="text" 
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                placeholder="Nome do síndico"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Telefone *</label>
              <input 
                required
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">E-mail</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Endereço *</label>
            <textarea 
              required
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all min-h-[100px] resize-none"
              placeholder="Rua, Número, Bairro, Cidade"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Observações</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all min-h-[100px] resize-none"
              placeholder="Informações adicionais..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button"
              onClick={closeModal}
              className="px-8 py-4 text-zinc-400 dark:text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!clientToDelete} 
        onClose={() => setClientToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-6">
          <p className="text-zinc-500 dark:text-zinc-400 font-bold">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-4 pt-4">
            <button 
              onClick={() => setClientToDelete(null)}
              className="px-8 py-4 text-zinc-400 dark:text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (clientToDelete) deleteClient(clientToDelete);
                setClientToDelete(null);
              }}
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
