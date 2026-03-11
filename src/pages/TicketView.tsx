import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, clients, checklistItems, companyLogo, companyData } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const ticket = tickets.find(t => t.id === id);
  const client = clients.find(c => c.id === ticket?.clientId);

  if (!ticket || !client) {
    return <div className="p-8 text-center text-gray-500">Ordem de Serviço não encontrada.</div>;
  }

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);
    try {
      // Use html-to-image instead of html2canvas to support modern CSS like oklch
      const imgData = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // equivalent to scale: 2
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need to calculate the height based on the element's aspect ratio
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Create a safe filename
      const dateStr = new Date(ticket.date).toLocaleDateString('pt-BR').replace(/\//g, '-');
      const safeName = client.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
      const fileName = `OS_${ticket.type}_${safeName}_${dateStr}.pdf`;
      
      // Explicit download approach
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank'; // Try to open in new tab if download is blocked in iframe
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Ocorreu um erro ao gerar o PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-zinc-800 card-shadow active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Visualização</p>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Detalhes da O.S.</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link 
            to={`/tickets/${ticket.id}/edit`}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 card-shadow flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <button 
            onClick={handlePrint}
            className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 card-shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 card-shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {isGenerating ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
      </div>

      <div 
        ref={printRef} 
        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] card-shadow border border-zinc-100 dark:border-zinc-800 p-12 print:shadow-none print:border-none print:p-0 overflow-hidden relative"
      >
        {/* Decorative Brand Bar */}
        <div className="absolute top-0 left-0 w-2 h-full bg-zinc-900 dark:bg-zinc-100 print:bg-zinc-900" />

        {/* Cabeçalho do Relatório */}
        <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-10 mb-10 flex justify-between items-start">
          <div className="flex items-center gap-8">
            {companyLogo && (
              <img src={companyLogo} alt="Logo" className="h-20 w-auto object-contain" />
            )}
            <div>
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Relatório de Manutenção</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest text-[10px] mt-2">
                {ticket.type === 'CORRETIVA' ? 'Manutenção Corretiva' : 'Manutenção Preventiva / Checklist'}
              </p>
              {companyData && (
                <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{companyData.name}</p>
                  <p>CNPJ: {companyData.document} | Tel: {companyData.phone}</p>
                  <p>{companyData.email}</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Data da OS</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{new Date(ticket.date).toLocaleDateString('pt-BR')}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-4 mb-1">Técnico Responsável</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{ticket.technician}</p>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="mb-12 bg-zinc-50 dark:bg-zinc-800/30 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 print:bg-zinc-50 print:border-zinc-200">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Dados do Cliente</h3>
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Nome / Condomínio</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">CNPJ / CPF</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.document || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Responsável</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.contactPerson || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Telefone</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">E-mail</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.email || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Endereço</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.address}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo Específico */}
        {ticket.type === 'CORRETIVA' ? (
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Problema Relatado</h3>
              <p className="text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{ticket.reportedProblem}</p>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Relato da Ordem de Serviço</h3>
              <p className="text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{ticket.serviceReport}</p>
            </div>

            {ticket.productsForQuote && (
              <div className="bg-zinc-900 dark:bg-zinc-800 p-8 rounded-[2rem] border border-transparent print:bg-zinc-900">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Produtos para Orçamento</h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{ticket.productsForQuote}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">Resultados do Checklist</h3>
            
            <div className="overflow-hidden border border-zinc-100 dark:border-zinc-800 rounded-[2rem]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Tarefa</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 w-32 text-center">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {ticket.checklistResults?.map(result => {
                    const item = checklistItems.find(i => i.id === result.taskId);
                    if (!item) return null;
                    
                    return (
                      <tr key={result.taskId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="p-6 text-zinc-900 dark:text-zinc-300 font-bold">{item.task}</td>
                        <td className="p-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            result.status === 'OK' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' :
                            result.status === 'NOK' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50' :
                            'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-6 text-zinc-500 dark:text-zinc-400 italic">{result.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Observações Gerais */}
        {ticket.observations && (
          <div className="mt-12">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Observações Gerais</h3>
            <p className="text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{ticket.observations}</p>
          </div>
        )}

        {/* Assinaturas */}
        <div className="mt-20 pt-12 grid grid-cols-2 gap-12">
          <div className="text-center space-y-4">
            <div className="border-t-2 border-zinc-900 dark:border-zinc-100 w-4/5 mx-auto"></div>
            <div>
              <p className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{ticket.technician}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Técnico Responsável</p>
            </div>
          </div>
          <div className="text-center space-y-4">
            <div className="border-t-2 border-zinc-900 dark:border-zinc-100 w-4/5 mx-auto"></div>
            <div>
              <p className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{client.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente / Síndico(a)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
