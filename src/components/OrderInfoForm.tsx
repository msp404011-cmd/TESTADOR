import React from 'react';
import { ServiceOrder } from '../types/order';
import {
  User,
  Smartphone,
  ShieldAlert,
  KeyRound,
  FileText,
  DollarSign,
  Grid,
} from 'lucide-react';

interface OrderInfoFormProps {
  order: ServiceOrder;
  onChangeOrder: (updated: ServiceOrder) => void;
  onOpenPatternModal: () => void;
}

const COMMON_BRANDS = ['Samsung', 'Apple', 'Motorola', 'Xiaomi', 'Realme', 'LG', 'Asus', 'Outra'];

export const OrderInfoForm: React.FC<OrderInfoFormProps> = ({
  order,
  onChangeOrder,
  onOpenPatternModal,
}) => {
  const handleCustomerChange = (field: keyof ServiceOrder['customer'], value: string) => {
    onChangeOrder({
      ...order,
      customer: { ...order.customer, [field]: value },
    });
  };

  const handleDeviceChange = (field: keyof ServiceOrder['device'], value: unknown) => {
    onChangeOrder({
      ...order,
      device: { ...order.device, [field]: value },
    });
  };

  const handleAccessoryToggle = (key: keyof ServiceOrder['device']['accessories']) => {
    onChangeOrder({
      ...order,
      device: {
        ...order.device,
        accessories: {
          ...order.device.accessories,
          [key]: !order.device.accessories[key],
        },
      },
    });
  };

  const handlePhysicalToggle = (key: keyof ServiceOrder['device']['physicalCondition']) => {
    onChangeOrder({
      ...order,
      device: {
        ...order.device,
        physicalCondition: {
          ...order.device.physicalCondition,
          [key]: !order.device.physicalCondition[key],
        },
      },
    });
  };

  const handleBudgetChange = (field: keyof ServiceOrder['budget'], value: unknown) => {
    const updatedBudget = { ...order.budget, [field]: value };
    const services = Number(field === 'servicesCost' ? value : updatedBudget.servicesCost) || 0;
    const parts = Number(field === 'partsCost' ? value : updatedBudget.partsCost) || 0;
    const discount = Number(field === 'discount' ? value : updatedBudget.discount) || 0;
    updatedBudget.totalCost = Math.max(0, services + parts - discount);

    onChangeOrder({
      ...order,
      budget: updatedBudget,
    });
  };

  return (
    <div className="space-y-6">
      {/* OS HEADER STATUS BAR */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-sm">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-100">{order.orderNumber}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Técnico Resp:{' '}
                <input
                  type="text"
                  value={order.budget.technicianName}
                  onChange={(e) => handleBudgetChange('technicianName', e.target.value)}
                  className="bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:outline-hidden text-slate-200 px-1 py-0.5"
                  placeholder="Nome do Técnico"
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Status da OS:</span>
            <select
              value={order.status}
              onChange={(e) => onChangeOrder({ ...order, status: e.target.value as ServiceOrder['status'] })}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="in_analysis">Em Análise / Bancada</option>
              <option value="approved">Orçamento Aprovado</option>
              <option value="in_repair">Em Reparo / Aguardando Peça</option>
              <option value="ready">Pronto para Retirada</option>
              <option value="delivered">Entregue ao Cliente</option>
            </select>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: CLIENT & DEVICE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CUSTOMER CARD */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Dados do Cliente</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Nome Completo</label>
              <input
                type="text"
                value={order.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={order.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">CPF / Documento</label>
              <input
                type="text"
                value={order.customer.document}
                onChange={(e) => handleCustomerChange('document', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">E-mail (Opcional)</label>
              <input
                type="email"
                value={order.customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* DEVICE CARD */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Identificação do Aparelho</h3>
          </div>

          {/* Quick brand selectors */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Fabricante / Marca</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleDeviceChange('brand', b)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    order.device.brand === b
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Modelo Exato</label>
              <input
                type="text"
                value={order.device.model}
                onChange={(e) => handleDeviceChange('model', e.target.value)}
                placeholder="Ex: Galaxy S23 Ultra / iPhone 13"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Cor do Aparelho</label>
              <input
                type="text"
                value={order.device.color}
                onChange={(e) => handleDeviceChange('color', e.target.value)}
                placeholder="Ex: Preto, Azul, Titânio"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">IMEI (Digite *#06#)</label>
              <input
                type="text"
                value={order.device.imei}
                onChange={(e) => handleDeviceChange('imei', e.target.value)}
                placeholder="354892019283745"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Nº de Série / SN</label>
              <input
                type="text"
                value={order.device.serialNumber}
                onChange={(e) => handleDeviceChange('serialNumber', e.target.value)}
                placeholder="R58T30AB..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UNLOCK SECURITY & ACCESSORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UNLOCK METHOD */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Senha e Desbloqueio para Testes</h3>
          </div>

          <div className="flex items-center gap-2">
            {(['none', 'pin', 'password', 'pattern'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleDeviceChange('lockType', type)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  order.device.lockType === type
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'none' && 'Sem Senha'}
                {type === 'pin' && 'PIN Numérico'}
                {type === 'password' && 'Alfanumérica'}
                {type === 'pattern' && 'Padrão (Desenho)'}
              </button>
            ))}
          </div>

          {order.device.lockType !== 'none' && order.device.lockType !== 'pattern' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Código de Desbloqueio</label>
              <input
                type="text"
                value={order.device.lockPassword}
                onChange={(e) => handleDeviceChange('lockPassword', e.target.value)}
                placeholder="Ex: 1234 ou senha do cliente"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          {order.device.lockType === 'pattern' && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
              <div>
                <span className="text-xs font-medium text-slate-300">Padrão de 9 Pontos</span>
                <p className="text-[11px] text-slate-400">
                  {order.device.patternNodes && order.device.patternNodes.length > 0 ? (
                    <span className="text-emerald-400 font-mono">
                      Ligação: {order.device.patternNodes.map((p) => p + 1).join(' → ')}
                    </span>
                  ) : (
                    'Nenhum padrão desenhado'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenPatternModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Grid className="w-3.5 h-3.5 text-emerald-400" />
                Desenhar Padrão
              </button>
            </div>
          )}
        </div>

        {/* ACCESSORIES LEFT */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Acessórios Deixados na Entrada</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'case', label: 'Capinha' },
              { key: 'screenProtector', label: 'Película' },
              { key: 'cable', label: 'Cabo USB' },
              { key: 'charger', label: 'Carregador' },
              { key: 'simCardLeft', label: 'Chip Deixado' },
              { key: 'memoryCardLeft', label: 'Cartão MicroSD' },
            ].map((acc) => {
              const k = acc.key as keyof ServiceOrder['device']['accessories'];
              const isChecked = Boolean(order.device.accessories[k]);
              return (
                <button
                  key={acc.key}
                  type="button"
                  onClick={() => handleAccessoryToggle(k)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs border text-left transition-colors ${
                    isChecked
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300 font-medium'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-emerald-500 text-black font-bold' : 'border border-slate-600'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                  <span>{acc.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <input
              type="text"
              value={order.device.accessories.other}
              onChange={(e) =>
                onChangeOrder({
                  ...order,
                  device: {
                    ...order.device,
                    accessories: { ...order.device.accessories, other: e.target.value },
                  },
                })
              }
              placeholder="Outros pertences deixados (ex: caixa original, chave SIM)..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* PHYSICAL CONDITION & DEFECT NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VISUAL DAMAGE & AVARIAS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Condições Estéticas / Avarias Prévias</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'screenCracked', label: 'Tela Trincada' },
              { key: 'scratches', label: 'Arranhões no Vidro/Aro' },
              { key: 'dents', label: 'Marcas de Queda / Amassados' },
              { key: 'backCoverBroken', label: 'Tampa Traseira Trincada' },
              { key: 'missingScrews', label: 'Falta Parafusos' },
              { key: 'waterDamageIndication', label: 'Indício de Contato com Líquido' },
            ].map((cond) => {
              const k = cond.key as keyof ServiceOrder['device']['physicalCondition'];
              const isChecked = Boolean(order.device.physicalCondition[k]);
              return (
                <button
                  key={cond.key}
                  type="button"
                  onClick={() => handlePhysicalToggle(k)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs border text-left transition-colors ${
                    isChecked
                      ? 'border-amber-500/60 bg-amber-950/30 text-amber-300 font-medium'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-amber-500 text-black font-bold' : 'border border-slate-600'
                    }`}
                  >
                    {isChecked ? '!' : ''}
                  </div>
                  <span className="leading-tight">{cond.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <textarea
              rows={2}
              value={order.device.physicalCondition.notes}
              onChange={(e) =>
                onChangeOrder({
                  ...order,
                  device: {
                    ...order.device,
                    physicalCondition: { ...order.device.physicalCondition, notes: e.target.value },
                  },
                })
              }
              placeholder="Descreva detalhes visuais para segurança da loja (ex: aro empenado, botão com tinta descascando)..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* DEFECT RECLAIMED & DIAGNOSIS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Reclamação & Laudo Técnico</h3>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Defeito Relatado pelo Cliente
            </label>
            <input
              type="text"
              value={order.budget.reportedDefect}
              onChange={(e) => handleBudgetChange('reportedDefect', e.target.value)}
              placeholder="Ex: Não carrega na tomada, esquenta muito e som sumiu"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Diagnóstico do Técnico / Solução Proposta
            </label>
            <textarea
              rows={2}
              value={order.budget.technicalDiagnosis}
              onChange={(e) => handleBudgetChange('technicalDiagnosis', e.target.value)}
              placeholder="Ex: Desoxidação do conector tipo C e troca de subplaca original..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* BUDGET & WARRANTY SUMMARY */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Orçamento & Garantia do Serviço</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Mão de Obra (R$)</label>
            <input
              type="number"
              value={order.budget.servicesCost || ''}
              onChange={(e) => handleBudgetChange('servicesCost', Number(e.target.value))}
              placeholder="0,00"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Peças / Materiais (R$)</label>
            <input
              type="number"
              value={order.budget.partsCost || ''}
              onChange={(e) => handleBudgetChange('partsCost', Number(e.target.value))}
              placeholder="0,00"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Desconto (R$)</label>
            <input
              type="number"
              value={order.budget.discount || ''}
              onChange={(e) => handleBudgetChange('discount', Number(e.target.value))}
              placeholder="0,00"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Garantia (Dias)</label>
            <input
              type="number"
              value={order.budget.warrantyDays || 90}
              onChange={(e) => handleBudgetChange('warrantyDays', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex flex-col justify-center">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">Valor Total</span>
            <span className="font-mono text-base font-bold text-emerald-300">
              R$ {Number(order.budget.totalCost || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
