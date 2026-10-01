import React from 'react';
import { ServiceOrder } from '../types/order';
import { X, Plus, Search, Trash2, Smartphone } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ServiceOrder[];
  activeOrderId: string;
  onSelectOrder: (id: string) => void;
  onNewOrder: () => void;
  onDeleteOrder: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  activeOrderId,
  onSelectOrder,
  onNewOrder,
  onDeleteOrder,
}) => {
  const [search, setSearch] = React.useState('');

  if (!isOpen) return null;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchNumber = o.orderNumber.toLowerCase().includes(q);
    const matchClient = o.customer.name.toLowerCase().includes(q);
    const matchDevice = `${o.device.brand} ${o.device.model}`.toLowerCase().includes(q);
    const matchImei = o.device.imei.toLowerCase().includes(q);
    return matchNumber || matchClient || matchDevice || matchImei;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-100">Histórico de Ordens de Serviço</h3>
            <p className="text-xs text-slate-400">Total de {orders.length} ordens salvas na bancada</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & New Order CTA */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <button
            onClick={() => {
              onNewOrder();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Ordem de Serviço
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nº OS, cliente, modelo ou IMEI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2">
          {filtered.map((ord) => {
            const isActive = ord.id === activeOrderId;
            return (
              <div
                key={ord.id}
                onClick={() => {
                  onSelectOrder(ord.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isActive
                    ? 'bg-slate-800 border border-emerald-500/50 shadow-sm'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {ord.orderNumber}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400">
                      {ord.checklistType === 'entry' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 truncate mt-1">
                    {ord.customer.name || 'Cliente sem nome'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Smartphone className="w-3 h-3 text-slate-500" />
                    <span className="truncate">
                      {ord.device.brand} {ord.device.model || 'Modelo não inf.'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 mt-2 font-mono">
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(ord.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {ord.budget.totalCost > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-300">
                      R$ {ord.budget.totalCost.toFixed(2)}
                    </span>
                  )}
                  {orders.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deseja realmente excluir a ${ord.orderNumber}?`)) {
                          onDeleteOrder(ord.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Excluir OS"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma ordem de serviço localizada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
