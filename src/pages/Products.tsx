import React, { useState, useRef } from 'react';
import { useStore, Product } from '../store';
import { Plus, Trash2, Edit, FileSpreadsheet, Search } from 'lucide-react';
import Papa from 'papaparse';
import { Modal } from '../components/Modal';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, importProducts } = useStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    code: '',
    name: '',
    description: '',
    price: 0,
    unit: 'UN'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedProducts: Omit<Product, 'id'>[] = results.data.map((row: any) => {
          const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('prod'));
          const priceKey = Object.keys(row).find(k => k.toLowerCase().includes('preco') || k.toLowerCase().includes('preço') || k.toLowerCase().includes('valor'));
          const codeKey = Object.keys(row).find(k => k.toLowerCase().includes('cod') || k.toLowerCase().includes('cód'));
          const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc'));
          const unitKey = Object.keys(row).find(k => k.toLowerCase().includes('unid') || k.toLowerCase().includes('medida'));

          const name = nameKey ? row[nameKey] : Object.values(row)[0] as string;
          
          let price = 0;
          if (priceKey) {
            const priceStr = String(row[priceKey]).replace(/[R$\s]/g, '').replace(',', '.');
            price = parseFloat(priceStr);
          }

          return {
            name: name || 'Produto sem nome',
            price: isNaN(price) ? 0 : price,
            code: codeKey ? row[codeKey] : '',
            description: descKey ? row[descKey] : '',
            unit: unitKey ? row[unitKey] : 'UN'
          };
        });

        importProducts(parsedProducts);
        alert(`${parsedProducts.length} produtos importados com sucesso!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0) return;

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ code: '', name: '', description: '', price: 0, unit: 'UN' });
  };

  const handleEdit = (product: Product) => {
    setFormData({
      code: product.code || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      unit: product.unit || 'UN'
    });
    setEditingId(product.id);
    setIsAdding(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Produtos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Catálogo de peças e serviços</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
            id="csv-upload-products"
          />
          <label 
            htmlFor="csv-upload-products"
            className="bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer card-shadow"
          >
            <FileSpreadsheet className="w-5 h-5 text-zinc-400 dark:text-zinc-500" /> IMPORTAR CSV
          </label>
          <button 
            onClick={() => {
              setFormData({ code: '', name: '', description: '', price: 0, unit: 'UN' });
              setEditingId(null);
              setIsAdding(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-6 h-6" /> 
            <span>NOVO PRODUTO</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 card-shadow overflow-hidden">
        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl focus:border-black dark:focus:border-white outline-none font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.15em] font-black">
                <th className="p-6 w-32">Código</th>
                <th className="p-6">Nome / Descrição</th>
                <th className="p-6 w-24">Unid.</th>
                <th className="p-6 w-32 text-right">Preço</th>
                <th className="p-6 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-6 text-sm text-zinc-400 dark:text-zinc-500 font-mono font-bold">
                    {product.code || '-'}
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">{product.description}</p>
                    )}
                  </td>
                  <td className="p-6 text-sm text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                    {product.unit || 'UN'}
                  </td>
                  <td className="p-6 font-black text-zinc-900 dark:text-white text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-2 text-zinc-300 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-black uppercase text-xs tracking-widest">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Nome *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Código</label>
              <input 
                type="text" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Unidade</label>
              <input 
                type="text" 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                placeholder="Ex: UN, KG, M"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Preço (R$) *</label>
              <input 
                type="number" 
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Descrição</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-700 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-8 py-4 text-zinc-400 dark:text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Salvar Produto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
