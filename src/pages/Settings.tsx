import React, { useRef, useState, useEffect } from 'react';
import { useStore, CompanyData } from '../store';
import { Upload, Trash2, Image as ImageIcon, Save, Download, Database, FileUp } from 'lucide-react';

export default function Settings() {
  const { 
    companyLogo, setCompanyLogo, 
    companyData, setCompanyData,
    clients, checklistItems, tickets, quotes, receipts, costs, appointments, products,
    restoreData
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    website: ''
  });

  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
    }
  }, [companyData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveData = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyData(formData);
    alert('Dados da empresa salvos com sucesso!');
  };

  const handleExportBackup = () => {
    const backupData = {
      clients,
      checklistItems,
      tickets,
      quotes,
      receipts,
      costs,
      appointments,
      products,
      companyLogo,
      companyData,
      version: '1.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_iac_tec_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (confirm('Atenção: Restaurar um backup irá substituir todos os dados atuais. Deseja continuar?')) {
            restoreData(json);
            alert('Backup restaurado com sucesso!');
          }
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          alert('Erro ao importar backup. Verifique se o arquivo é um JSON válido.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Configurações</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Gerencie as informações da sua empresa e backups</p>
      </div>
      
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow p-8 md:p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 border-b border-zinc-50 dark:border-zinc-800 pb-4 mb-8">Logo da Empresa</h2>
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="w-56 h-56 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/30 overflow-hidden shrink-0 transition-all hover:border-zinc-900 dark:hover:border-white group">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo da Empresa" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-center text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sem logo</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Adicione a logo da sua empresa para que ela apareça no menu lateral e nos relatórios em PDF gerados pelo sistema.
              </p>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Recomendamos uma imagem com fundo transparente (PNG) ou branco (JPG).
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  <Upload className="w-5 h-5" /> ESCOLHER IMAGEM
                </button>
                
                {companyLogo && (
                  <button 
                    onClick={() => setCompanyLogo(null)}
                    className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-red-600 dark:hover:text-red-400 transition-all card-shadow active:scale-95 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" /> Remover Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow p-8 md:p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 border-b border-zinc-50 dark:border-zinc-800 pb-4 mb-8">Dados da Empresa</h2>
          <form onSubmit={handleSaveData} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Nome da Empresa / Razão Social *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">CNPJ / CPF *</label>
                <input 
                  type="text" 
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Telefone / WhatsApp *</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">E-mail *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Endereço Completo *</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Site (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.website || ''}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-8 border-t border-zinc-50 dark:border-zinc-800">
              <button 
                type="submit"
                className="btn-primary"
              >
                <Save className="w-5 h-5" /> SALVAR DADOS
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow p-8 md:p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 border-b border-zinc-50 dark:border-zinc-800 pb-4 mb-8 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-900 dark:text-white" />
            Backup e Restauração
          </h2>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Gere uma cópia de segurança de todos os seus dados (clientes, ordens, produtos, etc.) para salvar em outro local ou restaurar em caso de necessidade.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExportBackup}
              className="btn-primary"
            >
              <Download className="w-5 h-5" /> GERAR BACKUP COMPLETO
            </button>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={backupInputRef}
                onChange={handleImportBackup}
              />
              <button 
                onClick={() => backupInputRef.current?.click()}
                className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-all card-shadow active:scale-95 flex items-center gap-2"
              >
                <FileUp className="w-5 h-5" /> Restaurar Backup
              </button>
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-zinc-900 dark:bg-white rounded-[2rem] shadow-xl">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] leading-relaxed">
              <strong className="text-white dark:text-zinc-900 block mb-2 text-xs">Aviso Importante:</strong> Ao restaurar um backup, todos os dados atuais do sistema serão substituídos pelos dados contidos no arquivo. Recomendamos gerar um backup dos dados atuais antes de realizar uma restauração.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
