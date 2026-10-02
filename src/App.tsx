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
import { createNewOrder } from './utils/orderStorage';
import { createEmptyChecklist, CHECKLIST_ITEMS } from './data/initialChecklist';
import { Header } from './components/Header';
import { DeviceHeroCard } from './components/DeviceHeroCard';
import { CategoryTestCards, CATEGORY_CARDS, CategoryCardConfig } from './components/CategoryTestCards';
import { TestSelectionView } from './components/TestSelectionView';
import { GuidedTestRunner } from './components/GuidedTestRunner';
import { TestResultsView } from './components/TestResultsView';
import { BottomNavBar, MainNavTab } from './components/BottomNavBar';
import { HardwareTesterModal } from './components/HardwareTesterModal';
import { FullscreenTouchTester } from './components/FullscreenTouchTester';
import { TestImagePreviewModal } from './components/TestImagePreviewModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useRealDeviceInfo } from './hooks/useRealDeviceInfo';
import { generateTestReportImage, calculateReportStats } from './utils/generateTestReportImage';
import {
  CheckCircle,
  Play,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [currentOrder, setCurrentOrder] = useState<ServiceOrder>(() => createNewOrder());
  const [activeScreen, setActiveScreen] = useState<MainNavTab | 'runner'>('home');
  const [runnerCategories, setRunnerCategories] = useState<CategoryCardConfig[]>(CATEGORY_CARDS);

  // Hardware modals
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isFullscreenTouchOpen, setIsFullscreenTouchOpen] = useState(false);
  const [testerKey, setTesterKey] = useState<ChecklistItemKey | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Image preview modal state
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [reportImageDataUrl, setReportImageDataUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Real smartphone hardware detection (Brand, Model, OS, RAM, Storage, Screen Resolution, Battery)
  const realDeviceInfo = useRealDeviceInfo();

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotification(message);
    toastTimerRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const handleUpdateChecklistItem = (
    key: ChecklistItemKey,
    partial: Partial<ChecklistItemState>
  ) => {
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

  const handleResetTest = () => {
    const emptyChecklist = createEmptyChecklist();
    const fresh = createNewOrder();
    fresh.checklist = emptyChecklist;
    setCurrentOrder(fresh);
    setReportImageDataUrl(null);
    setActiveScreen('home');
    showToast('Testes zerados para novo diagnóstico!');
  };

  // WhatsApp formatted report using real detected device hardware specifications
  const handleShareWhatsApp = () => {
    const stats = calculateReportStats(currentOrder.checklist);
    const devTitle = [realDeviceInfo.brand !== 'Não disponível' ? realDeviceInfo.brand : '', realDeviceInfo.model !== 'Não disponível' ? realDeviceInfo.model : 'Smartphone'].filter(Boolean).join(' ');

    let text = `*📋 LAUDO DE TESTE E DIAGNÓSTICO DO CELULAR*\n`;
    text += `📱 *Aparelho:* ${devTitle}\n`;
    text += `🤖 *Sistema:* ${realDeviceInfo.osName} ${realDeviceInfo.osVersion || ''}\n`;
    text += `💾 *Memória RAM:* ${realDeviceInfo.ramText}\n`;
    text += `💽 *Memória Interna:* ${realDeviceInfo.storageText} (${realDeviceInfo.storageAvailableText})\n`;
    text += `📺 *Resolução da Tela:* ${realDeviceInfo.screenText}\n`;
    if (realDeviceInfo.batteryPercent !== null) {
      text += `🔋 *Bateria:* ${realDeviceInfo.batteryText}\n`;
    }
    text += `\n*── RESULTADO DOS TESTES DE HARDWARE ──*\n`;

    CHECKLIST_ITEMS.forEach((item) => {
      const state = currentOrder.checklist[item.key];
      const status = state?.status || '';
      let emoji = '⚪';
      let statusText = 'Não testado';

      if (status === 'sim' || status === 'funciona' || status === 'sim_area') {
        emoji = '✅';
        statusText = 'APROVADO / OK';
      } else if (status === 'com_detalhes' || status === 'com_dificuldade' || status === 'mau_toque') {
        emoji = '⚠️';
        statusText = 'COM DETALHES';
      } else if (status === 'nao' || status === 'nao_funciona' || status === 'nao_area') {
        emoji = '❌';
        statusText = 'NÃO FUNCIONA';
      } else if (status === 'nao_possui') {
        emoji = '➖';
        statusText = 'NÃO POSSUI';
      }

      text += `${emoji} *${item.title}:* ${statusText}`;
      if (state?.observation) {
        text += ` _(${state.observation})_`;
      }
      text += `\n`;
    });

    text += `\n*RESUMO GERAL:* ${stats.approved} OK • ${stats.details} Atenção • ${stats.failed} Falhas`;

    navigator.clipboard.writeText(text).then(
      () => {
        showToast('Relatório copiado e abrindo WhatsApp...');
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
          '_blank'
        );
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

  // Generate image and open preview modal first
  const handleGenerateAndPreviewImage = async () => {
    try {
      setIsGeneratingImage(true);
      const dataUrl = await generateTestReportImage(currentOrder.checklist, {
        brand: realDeviceInfo.brand !== 'Não disponível' ? realDeviceInfo.brand : '',
        model: realDeviceInfo.model !== 'Não disponível' ? realDeviceInfo.model : '',
        osName: realDeviceInfo.osName,
        osVersion: realDeviceInfo.osVersion,
        ramText: realDeviceInfo.ramText,
        storageText: realDeviceInfo.storageText,
        screenText: realDeviceInfo.screenText,
      });
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
  const testedCount = stats.total - stats.untested;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* TOP HEADER matching reference image */}
      <Header
        onResetTest={handleResetTest}
        onGenerateImage={handleGenerateAndPreviewImage}
        onShareWhatsApp={handleShareWhatsApp}
      />

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl transition-all border border-emerald-400/40">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="no-print flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 space-y-5 pb-24">
        {/* SCREEN 1: INÍCIO / HOME (matching reference image Screen 1) */}
        {activeScreen === 'home' && (
          <div className="space-y-4 animate-fade-in">
            {/* Real Device Information Card with Mockup */}
            <DeviceHeroCard
              deviceInfo={realDeviceInfo}
            />

            {/* Primary Action Button: Iniciar teste completo matching reference image */}
            <button
              type="button"
              onClick={() => {
                setRunnerCategories(CATEGORY_CARDS);
                setActiveScreen('runner');
              }}
              className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-xl shadow-blue-950/60 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <span className="block text-sm sm:text-base font-extrabold leading-tight">
                    Iniciar teste completo
                  </span>
                  <span className="block text-xs font-normal text-blue-100">
                    Verifique todas as funções do aparelho
                  </span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* 3x3 Testes por categoria matching reference image */}
            <CategoryTestCards
              checklist={currentOrder.checklist}
              onOpenTest={handleOpenTester}
              batteryStatusText={realDeviceInfo.batteryText}
            />

            {/* Quick summary status footer */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Progresso dos testes:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 font-mono">
                  {stats.approved} OK
                </span>
                {stats.details > 0 && (
                  <span className="font-bold text-amber-400 font-mono">
                    • {stats.details} Atenção
                  </span>
                )}
                {stats.failed > 0 && (
                  <span className="font-bold text-rose-400 font-mono">
                    • {stats.failed} Falhas
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveScreen('results')}
                  className="ml-2 font-bold text-blue-400 hover:underline cursor-pointer"
                >
                  Ver laudo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: SELECIONAR TESTES (matching reference image Screen 2) */}
        {activeScreen === 'tests' && (
          <div className="animate-fade-in">
            <TestSelectionView
              onBack={() => setActiveScreen('home')}
              onStartSelected={(selected) => {
                setRunnerCategories(selected);
                setActiveScreen('runner');
              }}
            />
          </div>
        )}

        {/* SCREEN 3: EXECUÇÃO DO TESTE GUIADO (matching reference image Screen 3) */}
        {activeScreen === 'runner' && (
          <div className="animate-fade-in">
            <GuidedTestRunner
              checklist={currentOrder.checklist}
              selectedCategories={runnerCategories}
              onUpdateItem={(key, status, obs) => {
                handleUpdateChecklistItem(key, { status, observation: obs || '' });
                showToast('Status do teste gravado!');
              }}
              onOpenHardwareModal={handleOpenTester}
              onOpenFullscreenTouch={() => setIsFullscreenTouchOpen(true)}
              onComplete={() => setActiveScreen('results')}
              onBack={() => setActiveScreen('home')}
            />
          </div>
        )}

        {/* SCREEN 4: RESULTADO DO TESTE (matching reference image Screen 4) */}
        {activeScreen === 'results' && (
          <div className="animate-fade-in">
            <TestResultsView
              checklist={currentOrder.checklist}
              deviceInfo={realDeviceInfo}
              onBack={() => setActiveScreen('home')}
              onNewTest={handleResetTest}
              onGenerateImage={handleGenerateAndPreviewImage}
              onShareWhatsApp={handleShareWhatsApp}
            />
          </div>
        )}
      </main>

      {/* DOCKED BOTTOM NAVIGATION BAR matching mobile thumb ergonomics */}
      <BottomNavBar
        currentTab={activeScreen === 'runner' ? 'tests' : activeScreen}
        onChangeTab={(tab) => setActiveScreen(tab)}
        testedCount={testedCount}
        totalCount={stats.total}
      />

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
          showToast('Item atualizado no checklist!');
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
          showToast(
            `Teste de toque finalizado: ${
              result.status === 'sim' ? 'Aprovado 100%' : 'Com ressalvas'
            }`
          );
        }}
      />

      {/* OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
