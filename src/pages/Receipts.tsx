import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Download, Printer, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';

export default function Receipts() {
  const { clients, companyLogo, companyData, addReceipt } = useStore();
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const handleSaveAndDownload = async () => {
    if (!clientId || value <= 0 || !description) {
      alert('Preencha todos os campos obrigatórios (Cliente, Valor e Descrição).');
      return;
    }

    if (!receiptRef.current) return;

    setIsGenerating(true);
    try {
      // Save to store
      addReceipt({
        clientId,
        value,
        description,
        date
      });

      // Generate PDF
      const dataUrl = await toJpeg(receiptRef.current, { quality: 0.95, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (receiptRef.current.offsetHeight * pdfWidth) / receiptRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recibo_${selectedClient?.name.replace(/\s+/g, '_')}_${date}.pdf`);
      
      alert('Recibo salvo e baixado com sucesso!');
      
      // Reset form
      setClientId('');
      setValue(0);
      setDescription('');
      
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      alert('Ocorreu um erro ao gerar o recibo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Recibos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Gere e salve recibos em PDF para seus clientes</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-all card-shadow active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" /> Imprimir
          </button>
          <button 
            onClick={handleSaveAndDownload}
            disabled={isGenerating || !clientId || value <= 0 || !description}
            className="btn-primary flex-1 md:flex-none disabled:opacity-50 disabled:scale-100"
          >
            <Download className="w-5 h-5" /> {isGenerating ? 'Gerando...' : 'SALVAR E BAIXAR PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-1 space-y-8 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 card-shadow p-8 print:hidden">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 border-b border-zinc-50 dark:border-zinc-800 pb-4 mb-6">Dados do Recibo</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Cliente *</label>
              <select 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Valor (R$) *</label>
              <input 
                type="number" 
                value={value || ''}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all font-mono"
                min="0"
                step="0.01"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Data *</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Referente a (Descrição) *</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 rounded-2xl px-6 py-4 outline-none font-bold text-zinc-900 dark:text-white transition-all min-h-[120px]"
                placeholder="Ex: Serviços de manutenção preventiva realizados no mês de março..."
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-100 dark:bg-zinc-900/30 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-x-auto print:p-0 print:bg-transparent print:border-none">
            
            {/* Actual Receipt to be printed/saved */}
            <div 
              ref={receiptRef}
              className="bg-white w-full max-w-[800px] mx-auto shadow-2xl p-16 text-zinc-900 print:shadow-none relative overflow-hidden"
              style={{ minHeight: '1056px' }} // A4 approximate ratio
            >
              {/* Left Vertical Brand Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-zinc-900"></div>

              {/* Header */}
              <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-12 mb-12">
                <div className="flex items-center gap-6">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain" />
                  ) : (
                    <div className="p-4 bg-zinc-900 rounded-2xl shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Recibo</h2>
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px] mt-2">Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div className="text-right text-[11px] font-bold text-zinc-500 uppercase tracking-wider space-y-1">
                  {companyData ? (
                    <>
                      <p className="font-black text-zinc-900 text-sm mb-2">{companyData.name}</p>
                      <p>CNPJ/CPF: {companyData.document}</p>
                      <p>{companyData.phone}</p>
                      <p>{companyData.email}</p>
                    </>
                  ) : (
                    <p className="italic">Configure os dados da empresa<br/>nas Configurações</p>
                  )}
                </div>
              </div>

              {/* Value Box */}
              <div className="flex justify-end mb-12">
                <div className="text-4xl font-black text-zinc-900 border-4 border-zinc-900 p-6 rounded-2xl inline-block tracking-tighter shadow-xl shadow-zinc-100">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-10 text-xl leading-relaxed font-medium text-zinc-800">
                <p>
                  Recebi(emos) de <strong className="uppercase font-black text-zinc-900">{selectedClient?.name || '__________________________________________________'}</strong>, 
                  {selectedClient?.document ? ` inscrito(a) no CNPJ/CPF sob o nº ${selectedClient.document}, ` : ' '}
                  a importância de <strong className="font-black text-zinc-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</strong>.
                </p>

                <p>
                  Referente a: <span className="italic font-bold text-zinc-600">{description || '________________________________________________________________________________________________________________________________________________________________'}</span>
                </p>

                <p className="text-base text-zinc-500 font-bold uppercase tracking-wider">
                  Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos legais.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-32 pt-12 text-center">
                <p className="mb-20 text-lg font-bold text-zinc-600">
                  _________________, {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <div className="w-80 border-t-2 border-zinc-900 mx-auto pt-6">
                  <p className="font-black text-zinc-900 uppercase tracking-widest">{companyData?.name || 'Assinatura do Recebedor'}</p>
                  {companyData?.document && <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-2">{companyData.document}</p>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
