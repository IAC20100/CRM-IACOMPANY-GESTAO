import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ChecklistManager() {
  const { checklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem, clients } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    task: string;
    category: string;
    clientIds: string[];
  }>({
    task: '',
    category: '',
    clientIds: []
  });

  const categories = Array.from(new Set(checklistItems.map(item => item.category))).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      task: formData.task,
      category: formData.category,
      clientIds: formData.clientIds
    };
    
    if (editingId) {
      updateChecklistItem(editingId, dataToSave);
    } else {
      addChecklistItem(dataToSave);
    }
    closeModal();
  };

  const openModal = (item?: typeof checklistItems[0]) => {
    if (item) {
      // Handle legacy clientId as well
      const initialClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
      setFormData({ task: item.task, category: item.category, clientIds: initialClientIds });
      setEditingId(item.id);
    } else {
      setFormData({ task: '', category: categories[0] || '', clientIds: [] });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ task: '', category: '', clientIds: [] });
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Checklist</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Configure os itens padrão para manutenções preventivas</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> NOVA TAREFA
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Tarefa</th>
                <th className="p-6">Categoria</th>
                <th className="p-6">Atribuído a</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {checklistItems.map(item => {
                const itemClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
                const assignedClients = clients.filter(c => itemClientIds.includes(c.id));
                
                return (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-6 text-sm font-bold text-zinc-900 dark:text-zinc-300">{item.task}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-6">
                      {assignedClients.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {assignedClients.map(client => (
                            <span key={client.id} className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                              {client.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Todos (Global)
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(item.id)}
                          className="p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {checklistItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-zinc-200 dark:text-zinc-800" />
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Nenhuma tarefa configurada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center p-8 border-b border-zinc-50 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                {editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <button onClick={closeModal} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Descrição da Tarefa</label>
                <input 
                  required
                  type="text" 
                  value={formData.task}
                  onChange={e => setFormData({...formData, task: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  placeholder="Ex: Verificar iluminação de emergência"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Categoria</label>
                <input 
                  required
                  type="text" 
                  list="categories"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  placeholder="Ex: Elétrica, Hidráulica, Segurança..."
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Atribuir a Condomínios/Clientes (Opcional)</label>
                <div className="max-h-56 overflow-y-auto border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-2 bg-zinc-50 dark:bg-zinc-800/50">
                  <label className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors group">
                    <input 
                      type="checkbox"
                      checked={formData.clientIds.length === 0}
                      onChange={() => setFormData({...formData, clientIds: []})}
                      className="w-5 h-5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                    />
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Todos (Checklist Global)</span>
                  </label>
                  
                  {clients.map(client => (
                    <label key={client.id} className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors group">
                      <input 
                        type="checkbox"
                        checked={formData.clientIds.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, clientIds: [...formData.clientIds, client.id]});
                          } else {
                            setFormData({...formData, clientIds: formData.clientIds.filter(id => id !== client.id)});
                          }
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                      />
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{client.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-3 uppercase tracking-widest">
                  Selecione um ou mais clientes. Se nenhum for selecionado, a tarefa aparecerá para todos.
                </p>
              </div>
              <div className="pt-6 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10 border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">Confirmar Exclusão</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-8 leading-relaxed">Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-8 py-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  deleteChecklistItem(itemToDelete);
                  setItemToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-100 dark:shadow-none active:scale-95"
              >
                EXCLUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
