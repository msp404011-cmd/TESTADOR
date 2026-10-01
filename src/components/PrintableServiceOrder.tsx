import React from 'react';
import { ServiceOrder } from '../types/order';
import { CHECKLIST_ITEMS } from '../data/initialChecklist';

interface PrintableServiceOrderProps {
  order: ServiceOrder;
}

export const PrintableServiceOrder: React.FC<PrintableServiceOrderProps> = ({ order }) => {
  const isEntry = order.checklistType === 'entry';

  return (
    <div className="hidden print:block text-slate-900 bg-white p-6 max-w-[210mm] mx-auto text-xs leading-normal">
      {/* HEADER */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight">ASSISTÊNCIA TÉCNICA & BANCADA</h1>
          <p className="text-[11px] text-slate-600">Comprovante de Entrada e Diagnóstico de Aparelho</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-bold bg-slate-100 px-3 py-1 border border-slate-300 rounded inline-block">
            {order.orderNumber}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* CLIENT & DEVICE DATA */}
      <div className="grid grid-cols-2 gap-4 mb-4 border border-slate-300 p-3 rounded">
        <div>
          <h2 className="font-bold border-b border-slate-300 pb-1 mb-1.5 uppercase text-[11px]">Dados do Cliente</h2>
          <p>
            <span className="font-semibold">Nome:</span> {order.customer.name || 'Não informado'}
          </p>
          <p>
            <span className="font-semibold">WhatsApp:</span> {order.customer.phone || 'Não informado'}
          </p>
          <p>
            <span className="font-semibold">CPF:</span> {order.customer.document || 'Não informado'}
          </p>
        </div>
        <div>
          <h2 className="font-bold border-b border-slate-300 pb-1 mb-1.5 uppercase text-[11px]">Dados do Aparelho</h2>
          <p>
            <span className="font-semibold">Aparelho:</span> {order.device.brand} {order.device.model} ({order.device.color || 'Cor não inf.'})
          </p>
          <p>
            <span className="font-semibold">IMEI:</span> {order.device.imei || 'Não informado'}
          </p>
          <p>
            <span className="font-semibold">Senha:</span>{' '}
            {order.device.lockType === 'none'
              ? 'Sem Senha'
              : order.device.lockType === 'pattern'
              ? `Padrão: [${order.device.patternNodes?.map((n) => n + 1).join('-') || 'Desenhado'}]`
              : order.device.lockPassword || 'Informada pelo cliente'}
          </p>
        </div>
      </div>

      {/* CHECKLIST TABLE */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <h2 className="font-bold uppercase text-[11px]">
            Checklist de Bancada ({isEntry ? 'Entrada / Recebimento' : 'Saída / Entrega'})
          </h2>
          <span className="text-[10px] text-slate-500">Total: 17 itens verificados</span>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="border border-slate-300 p-1.5 text-left w-6">#</th>
              <th className="border border-slate-300 p-1.5 text-left w-48">Item Avaliado</th>
              <th className="border border-slate-300 p-1.5 text-center w-36">Resultado</th>
              <th className="border border-slate-300 p-1.5 text-left">Observações Técnicas</th>
            </tr>
          </thead>
          <tbody>
            {CHECKLIST_ITEMS.map((item, index) => {
              const state = order.checklist[item.key] || { status: '', observation: '' };
              let statusLabel = state.status?.toUpperCase() || 'NÃO TESTADO';

              if (item.hasPresenceToggle && state.hasItem === false) {
                statusLabel = 'NÃO POSSUI';
              } else {
                const opt = item.options.find((o) => o.id === state.status);
                if (opt) statusLabel = opt.shortLabel || opt.label;
              }

              return (
                <tr key={item.key} className="border-b border-slate-200">
                  <td className="border border-slate-300 p-1 text-center font-mono">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="border border-slate-300 p-1 font-semibold">{item.title}</td>
                  <td className="border border-slate-300 p-1 text-center font-semibold">
                    {statusLabel}
                  </td>
                  <td className="border border-slate-300 p-1 italic text-slate-700">
                    {state.observation || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DEFECT & BUDGET */}
      <div className="grid grid-cols-2 gap-4 mb-4 border border-slate-300 p-3 rounded">
        <div>
          <h2 className="font-bold border-b border-slate-300 pb-1 mb-1.5 uppercase text-[11px]">Laudo & Defeito</h2>
          <p className="mb-1">
            <span className="font-semibold">Defeito Relatado:</span> {order.budget.reportedDefect || 'Não relatado'}
          </p>
          <p>
            <span className="font-semibold">Diagnóstico:</span> {order.budget.technicalDiagnosis || 'Em análise técnica'}
          </p>
          {order.device.physicalCondition.notes && (
            <p className="mt-1 text-[10px] text-slate-600">
              <span className="font-semibold">Avarias Prévias:</span> {order.device.physicalCondition.notes}
            </p>
          )}
        </div>
        <div>
          <h2 className="font-bold border-b border-slate-300 pb-1 mb-1.5 uppercase text-[11px]">Valores & Garantia</h2>
          <p>
            <span className="font-semibold">Mão de Obra:</span> R$ {Number(order.budget.servicesCost || 0).toFixed(2)}
          </p>
          <p>
            <span className="font-semibold">Peças:</span> R$ {Number(order.budget.partsCost || 0).toFixed(2)}
          </p>
          <p>
            <span className="font-semibold">Desconto:</span> R$ {Number(order.budget.discount || 0).toFixed(2)}
          </p>
          <p className="text-sm font-bold mt-1 text-slate-900 border-t border-slate-200 pt-1">
            Total a Pagar: R$ {Number(order.budget.totalCost || 0).toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Garantia legal do serviço executado: {order.budget.warrantyDays || 90} dias.
          </p>
        </div>
      </div>

      {/* TERMS */}
      <div className="border border-slate-200 p-2.5 rounded text-[9px] text-slate-600 mb-6 leading-tight">
        <p className="font-bold text-slate-800 mb-1">TERMO DE CIÊNCIA E AUTORIZAÇÃO:</p>
        <p>
          1. O cliente declara estar ciente do estado de conservação do aparelho e dos testes do checklist acima realizados no ato do recebimento.
          2. Aparelhos molhados, com placa oxidada ou tela quebrada podem sofrer apagamento durante a intervenção técnica por fragilidade prévia.
          3. Aparelhos não retirados em até 90 dias após o aviso de conclusão estarão sujeitos a cobrança de taxa de guarda ou descarte conforme Código Civil.
        </p>
      </div>

      {/* SIGNATURES */}
      <div className="grid grid-cols-2 gap-8 pt-4">
        <div className="text-center">
          <div className="border-t border-slate-400 pt-1 font-semibold">{order.customer.name || 'Assinatura do Cliente'}</div>
          <p className="text-[9px] text-slate-500">Cliente / Proprietário</p>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-400 pt-1 font-semibold">{order.budget.technicianName || 'Técnico Responsável'}</div>
          <p className="text-[9px] text-slate-500">Bancada Técnica Especializada</p>
        </div>
      </div>
    </div>
  );
};
