/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import {
  ServiceOrder,
  ChecklistItemKey,
  ChecklistItemState,
  ChecklistRecord,
} from './types/order';
import {
  createNewOrder,
  buildWhatsAppMessage,
} from './utils/orderStorage';
import { createEmptyChecklist } from './data/initialChecklist';
import { Header } from './components/Header';
import { ChecklistSection } from './components/ChecklistSection';
import { HardwareTesterModal } from './components/HardwareTesterModal';
import { FullscreenTouchTester } from './components/FullscreenTouchTester';
import { TestImagePreviewModal } from './components/TestImagePreviewModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { generateTestReportImage, calculateReportStats } from './utils/generateTestReportImage';
import {
  CheckCircle,
  Image as ImageIcon,
  Share2,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Always starts completely fresh and zeroed whenever the link is opened
  const [currentOrder, setCurrentOrder] = useState<ServiceOrder>(() => createNewOrder());

  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isFullscreenTouchOpen, setIsFullscreenTouchOpen] = useState(false);
  const [testerKey, setTesterKey] = useState<ChecklistItemKey | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Image preview modal state
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [reportImageDataUrl, setReportImageDataUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotification(message);
    toastTimerRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2500);
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
    setCurrentOrder({
      ...currentOrder,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBulkChecklistUpdate = (newChecklist: ChecklistRecord) => {
    setCurrentOrder({
      ...currentOrder,
      checklist: newChecklist,
      updatedAt: new Date().toISOString(),
    });
    showToast('Checklist atualizado!');
  };

  const handleResetTest = () => {
    const emptyChecklist = createEmptyChecklist();
    const fresh = createNewOrder();
    fresh.checklist = emptyChecklist;
    setCurrentOrder(fresh);
    setReportImageDataUrl(null);
    showToast('Checklist zerado com sucesso!');
  };

  const handleShareWhatsApp = () => {
    const text = buildWhatsAppMessage(currentOrder);
    navigator.clipboard.writeText(text).then(
      () => {
        const rawPhone = currentOrder.customer.phone.replace(/\D/g, '');
        if (rawPhone.length >= 10) {
          const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
          showToast('Relatório copiado e abrindo WhatsApp...');
          window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`, '_blank');
        } else {
          showToast('Relatório copiado para colar no WhatsApp!');
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

  // Generate image and open preview modal first ("MAS ANTES PEDE PRA VER")
  const handleGenerateAndPreviewImage = async () => {
    try {
      setIsGeneratingImage(true);
      const dataUrl = await generateTestReportImage(currentOrder.checklist, currentOrder.device);
      setReportImageDataUrl(dataUrl);
      setIsImagePreviewOpen(true);
    } catch (err) {
      console.error('Erro ao gerar imagem de teste', err);
      showToast('Erro ao gerar imagem do laudo.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const stats = calculateReportStats(currentOrder.checklist);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* TOP BAR */}
      <Header
        onResetTest={handleResetTest}
        onGenerateImage={handleGenerateAndPreviewImage}
        onShareWhatsApp={handleShareWhatsApp}
      />

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xl transition-all">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* CHECKLIST DE TESTES DO APARELHO */}
        <ChecklistSection
          checklist={currentOrder.checklist}
          checklistType={currentOrder.checklistType}
          onChangeChecklistType={(type) =>
            setCurrentOrder({ ...currentOrder, checklistType: type })
          }
          onUpdateItem={handleUpdateChecklistItem}
          onBulkUpdate={handleBulkChecklistUpdate}
          onOpenTester={handleOpenTester}
        />

        {/* BOTTOM CALL TO ACTION: GERAR IMAGEM DO TESTE */}
        <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 text-center shadow-xl space-y-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Finalizar Testes e Gerar Comprovante
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Gera uma imagem oficial em alta resolução com o laudo de todos os itens testados para salvar na galeria do aparelho celular ou enviar ao cliente.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 my-3 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                ✓ Aprovados: {stats.approved}
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                ⚠ C/ Detalhes: {stats.details}
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
                ✕ Reprovados: {stats.failed}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerateAndPreviewImage}
              disabled={isGeneratingImage}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5" />
              <span>{isGeneratingImage ? 'Gerando Imagem...' : 'Gerar Imagem do Laudo (Ver Antes de Salvar)'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Copiar Texto WhatsApp</span>
            </button>
          </div>
        </div>
      </main>

      {/* PREVIEW MODAL BEFORE SAVING IMAGE TO GALLERY */}
      <TestImagePreviewModal
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageDataUrl={reportImageDataUrl}
      />

      {/* HARDWARE DIAGNOSTICS MODAL (Touch, Flash, Câmera, Som, Auricular, Volume, etc.) */}
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

      {/* OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
