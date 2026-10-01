/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  ServiceOrder,
  ChecklistItemKey,
  ChecklistItemState,
  ChecklistRecord,
} from './types/order';
import {
  loadOrdersFromStorage,
  saveOrdersToStorage,
  createNewOrder,
  getActiveOrderId,
  setActiveOrderId,
  buildWhatsAppMessage,
} from './utils/orderStorage';
import { Header } from './components/Header';
import { ChecklistSection } from './components/ChecklistSection';
import { OrderInfoForm } from './components/OrderInfoForm';
import { HardwareTesterModal } from './components/HardwareTesterModal';
import { PatternUnlockModal } from './components/PatternUnlockModal';
import { FullscreenTouchTester } from './components/FullscreenTouchTester';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PrintableServiceOrder } from './components/PrintableServiceOrder';
import {
  Sparkles,
  Printer,
  Share2,
  FolderOpen,
  CheckCircle,
  FileText,
  Smartphone,
  Check,
} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<ServiceOrder[]>(() => loadOrdersFromStorage());
  const [activeOrderId, setActiveId] = useState<string>(() => {
    const saved = getActiveOrderId();
    if (saved && orders.some((o) => o.id === saved)) return saved;
    return orders[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'checklist' | 'order_info' | 'summary'>('checklist');
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isFullscreenTouchOpen, setIsFullscreenTouchOpen] = useState(false);
  const [testerKey, setTesterKey] = useState<ChecklistItemKey | null>(null);
  const [isPatternOpen, setIsPatternOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync active order ID to storage
  useEffect(() => {
    if (activeOrderId) {
      setActiveOrderId(activeOrderId);
    }
  }, [activeOrderId]);

  // Sync orders to storage
  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || createNewOrder();

  const handleUpdateCurrentOrder = (updated: ServiceOrder) => {
    const nextOrders = orders.map((o) => (o.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : o));
    setOrders(nextOrders);
  };

  const handleUpdateChecklistItem = (key: ChecklistItemKey, partial: Partial<ChecklistItemState>) => {
    const existing = currentOrder.checklist[key] || { status: '', observation: '' };
    const updatedChecklist: ChecklistRecord = {
      ...currentOrder.checklist,
      [key]: {
        ...existing,
        ...partial,
      },
    };
    handleUpdateCurrentOrder({
      ...currentOrder,
      checklist: updatedChecklist,
    });
  };

  const handleBulkChecklistUpdate = (newChecklist: ChecklistRecord) => {
    handleUpdateCurrentOrder({
      ...currentOrder,
      checklist: newChecklist,
    });
    showToast('Checklist atualizado com sucesso!');
  };

  const handleNewOrder = () => {
    const newOrd = createNewOrder();
    const updatedList = [newOrd, ...orders];
    setOrders(updatedList);
    setActiveId(newOrd.id);
    setActiveTab('checklist');
    showToast(`Nova Ordem ${newOrd.orderNumber} iniciada!`);
  };

  const handleDeleteOrder = (id: string) => {
    const remaining = orders.filter((o) => o.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewOrder();
      setOrders([fresh]);
      setActiveId(fresh.id);
    } else {
      setOrders(remaining);
      if (activeOrderId === id) {
        setActiveId(remaining[0].id);
      }
    }
    showToast('Ordem de serviço removida.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = buildWhatsAppMessage(currentOrder);
    navigator.clipboard.writeText(text).then(
      () => {
        const rawPhone = currentOrder.customer.phone.replace(/\D/g, '');
        if (rawPhone.length >= 10) {
          const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
          showToast('Relatório copiado e abrindo WhatsApp do cliente...');
          window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`, '_blank');
        } else {
          showToast('Relatório formatado copiado! Cole no WhatsApp do cliente.');
        }
      },
      () => {
        showToast('Não foi possível copiar automaticamente.');
      }
    );
  };

  const handleOpenTester = (key?: ChecklistItemKey) => {
    if (key === 'touch_screen') {
      setIsFullscreenTouchOpen(true);
      return;
    }
    setTesterKey(key || null);
    setIsTesterOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* PRINTABLE COMPONENT (Hidden on screen, visible only when printing) */}
      <PrintableServiceOrder order={currentOrder} />

      {/* TOP BAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrder={handleNewOrder}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onPrint={handlePrint}
        onShareWhatsApp={handleShareWhatsApp}
        onOpenTester={() => handleOpenTester()}
      />

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xl transition-all animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP STATUS TICKER & CONTEXT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-emerald-400">
              {currentOrder.orderNumber}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-xs">
              {currentOrder.device.brand} {currentOrder.device.model || 'Aparelho em Teste'}
            </span>
            {currentOrder.customer.name && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 truncate max-w-xs">
                  {currentOrder.customer.name}
                </span>
              </>
            )}
          </div>

          {/* Quick tab switcher for mobile/desktop */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'checklist'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Setor Checklist
            </button>
            <button
              onClick={() => setActiveTab('order_info')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'order_info'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dados da OS & Aparelho
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resumo & WhatsApp
            </button>
          </div>
        </div>

        {/* TAB 1: CHECKLIST SECTOR (Primary focus requested by user) */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <ChecklistSection
              checklist={currentOrder.checklist}
              checklistType={currentOrder.checklistType}
              onChangeChecklistType={(type) =>
                handleUpdateCurrentOrder({ ...currentOrder, checklistType: type })
              }
              onUpdateItem={handleUpdateChecklistItem}
              onBulkUpdate={handleBulkChecklistUpdate}
              onOpenTester={handleOpenTester}
            />
          </div>
        )}

        {/* TAB 2: ORDER & DEVICE DETAILS */}
        {activeTab === 'order_info' && (
          <div className="space-y-6">
            <OrderInfoForm
              order={currentOrder}
              onChangeOrder={handleUpdateCurrentOrder}
              onOpenPatternModal={() => setIsPatternOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: SUMMARY & QUICK SHARING */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Full Review */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">
                      Visualização do Laudo e Diagnóstico
                    </h3>
                    <p className="text-xs text-slate-400">
                      Revise todos os apontamentos antes de imprimir ou enviar ao cliente
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      Imprimir Folha A4
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Copiar WhatsApp
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Cliente</span>
                    <p className="font-medium text-slate-200">{currentOrder.customer.name || 'Nome não preenchido'}</p>
                    <p className="text-slate-400">{currentOrder.customer.phone || 'Telefone não preenchido'}</p>
                    <p className="text-slate-400">CPF: {currentOrder.customer.document || 'Não inf.'}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Aparelho em Reparo</span>
                    <p className="font-medium text-slate-200">
                      {currentOrder.device.brand} {currentOrder.device.model || 'Modelo não inf.'}
                    </p>
                    <p className="text-slate-400">Cor: {currentOrder.device.color || 'Não inf.'}</p>
                    <p className="text-slate-400 font-mono">IMEI: {currentOrder.device.imei || 'Não inf.'}</p>
                  </div>
                </div>

                {/* Preformatted text preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Mensagem Gerada para WhatsApp:</span>
                    <button
                      onClick={handleShareWhatsApp}
                      className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      Copiar Texto
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {buildWhatsAppMessage(currentOrder)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Col: Quick Actions & Details */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-slate-200">Ações Rápidas de Bancada</h4>

                <button
                  onClick={() => handleOpenTester()}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-100">Bancada de Testes</span>
                      <p className="text-[11px] text-slate-400">Touch, microfone, som e câmera</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Abrir →</span>
                </button>

                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-100">Histórico de OS</span>
                      <p className="text-[11px] text-slate-400">{orders.length} ordens salvas</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Ver →</span>
                </button>

                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Total Orçamento</span>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                    R$ {Number(currentOrder.budget.totalCost || 0).toFixed(2)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Garantia: {currentOrder.budget.warrantyDays || 90} dias
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* HARDWARE DIAGNOSTICS MODAL */}
      <HardwareTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        activeTestKey={testerKey}
        onUpdateChecklist={(key, status, obs) => {
          handleUpdateChecklistItem(key, { status, observation: obs || '' });
          showToast(`Item atualizado no checklist!`);
        }}
        onOpenFullscreenTouch={() => {
          setIsTesterOpen(false);
          setIsFullscreenTouchOpen(true);
        }}
      />

      {/* FULLSCREEN TOUCH TESTER */}
      <FullscreenTouchTester
        isOpen={isFullscreenTouchOpen}
        onClose={(result) => {
          setIsFullscreenTouchOpen(false);
          handleUpdateChecklistItem('touch_screen', {
            status: result.status,
            observation: result.observation,
          });
          showToast(`Teste de toque finalizado: ${result.status === 'sim' ? 'Aprovado 100%' : 'Com ressalvas'}`);
        }}
      />

      {/* PATTERN UNLOCK MODAL */}
      <PatternUnlockModal
        isOpen={isPatternOpen}
        onClose={() => setIsPatternOpen(false)}
        initialPattern={currentOrder.device.patternNodes}
        onSavePattern={(nodes) => {
          handleUpdateCurrentOrder({
            ...currentOrder,
            device: {
              ...currentOrder.device,
              lockType: 'pattern',
              patternNodes: nodes,
            },
          });
          showToast('Padrão salvo com sucesso!');
        }}
      />

      {/* SAVED ORDERS HISTORY DRAWER */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={orders}
        activeOrderId={activeOrderId}
        onSelectOrder={(id) => {
          setActiveId(id);
          showToast('Ordem de serviço carregada.');
        }}
        onNewOrder={handleNewOrder}
        onDeleteOrder={handleDeleteOrder}
      />
    </div>
  );
}
