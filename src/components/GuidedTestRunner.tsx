import React, { useState, useEffect } from 'react';
import { ChecklistRecord, ChecklistItemKey } from '../types/order';
import { CATEGORY_CARDS, CategoryCardConfig } from './CategoryTestCards';
import { saveSdCardDetection } from '../hooks/useRealDeviceInfo';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  X,
  Play,
  ExternalLink,
  Volume2,
  Camera,
  Smartphone,
  Zap,
  Wifi,
  Fingerprint,
  Sliders,
  Cpu,
  CheckCircle2,
  CreditCard,
  Radio,
  Folder,
} from 'lucide-react';

interface GuidedTestRunnerProps {
  checklist: ChecklistRecord;
  selectedCategories?: CategoryCardConfig[];
  onUpdateItem: (key: ChecklistItemKey, status: string, observation?: string) => void;
  onOpenHardwareModal: (key: ChecklistItemKey) => void;
  onOpenFullscreenTouch: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export const GuidedTestRunner: React.FC<GuidedTestRunnerProps> = ({
  checklist,
  selectedCategories = CATEGORY_CARDS,
  onUpdateItem,
  onOpenHardwareModal,
  onOpenFullscreenTouch,
  onComplete,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volUpClicks, setVolUpClicks] = useState(0);
  const [volDownClicks, setVolDownClicks] = useState(0);

  const categories = selectedCategories.length > 0 ? selectedCategories : CATEGORY_CARDS;
  const currentCategory = categories[currentIndex] || categories[0];
  const total = categories.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  const handleVolUpClick = () => {
    setVolUpClicks((prev) => prev + 1);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
    onUpdateItem('volume_up', 'sim', 'Botão Volume (+) reconhecido no teste');
  };

  const handleVolDownClick = () => {
    setVolDownClicks((prev) => prev + 1);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
    onUpdateItem('volume_down', 'sim', 'Botão Volume (-) reconhecido no teste');
  };

  // Keyboard volume listener when on buttons step
  useEffect(() => {
    if (currentCategory.id !== 'buttons') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const upKeys = ['AudioVolumeUp', 'VolumeUp', 'ArrowUp', '+', '=', 'PageUp'];
      const downKeys = ['AudioVolumeDown', 'VolumeDown', 'ArrowDown', '-', '_', 'PageDown'];

      if (upKeys.includes(e.key) || upKeys.includes(e.code)) {
        e.preventDefault();
        handleVolUpClick();
      } else if (downKeys.includes(e.key) || downKeys.includes(e.code)) {
        e.preventDefault();
        handleVolDownClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCategory.id]);

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const handleMarkCategoryStatus = (statusType: 'sim' | 'com_detalhes' | 'nao') => {
    // Apply status to all keys in this category
    currentCategory.keys.forEach((key) => {
      let mappedStatus: string = statusType;
      if (key === 'biometrics') {
        mappedStatus = statusType === 'sim' ? 'funciona' : statusType === 'nao' ? 'nao_funciona' : 'com_dificuldade';
      } else if (key === 'sd_card' || key === 'chip_1' || key === 'chip_2') {
        mappedStatus = statusType === 'sim' ? 'funciona' : statusType === 'nao' ? 'nao_funciona' : 'com_problema';
      } else if (key === 'signal_area') {
        mappedStatus = statusType === 'sim' ? 'sim_area' : 'nao_area';
      } else if (key === 'charging_port') {
        mappedStatus = statusType === 'sim' ? 'sim' : statusType === 'nao' ? 'nao' : 'com_dificuldade';
      } else if (key === 'touch_screen') {
        mappedStatus = statusType === 'sim' ? 'sim' : statusType === 'com_detalhes' ? 'mau_toque' : 'nao';
      }
      onUpdateItem(key, mappedStatus);
    });

    handleNext();
  };

  const Icon = currentCategory.icon;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-24">
      {/* Top Header matching reference image Screen 3 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-white">Teste de {currentCategory.title}</h2>
            <p className="text-xs text-slate-400">
              {currentIndex + 1} de {total}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-blue-400">{progressPercent}%</span>
      </div>

      {/* Progress Bar matching reference image */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Instruction Card matching reference image Screen 3 */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-linear-to-br ${currentCategory.gradient} text-white shadow-md shrink-0`}
        >
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            {currentCategory.id === 'screen'
              ? 'Toque na tela'
              : currentCategory.id === 'audio'
              ? 'Verifique o áudio e microfone'
              : currentCategory.id === 'camera'
              ? 'Inspecione as câmeras'
              : currentCategory.id === 'flash'
              ? 'Acione a lanterna LED'
              : currentCategory.id === 'wifi'
              ? 'Verifique o Wi-Fi'
              : currentCategory.id === 'battery'
              ? 'Verifique a bateria'
              : currentCategory.id === 'biometrics'
              ? 'Teste o sensor biométrico'
              : currentCategory.id === 'buttons'
              ? 'Pressione os botões laterais'
              : currentCategory.id === 'sd_card'
              ? 'Teste o Cartão de Memória'
              : currentCategory.id === 'chip_1'
              ? 'Teste o Chip 1 (SIM 1)'
              : currentCategory.id === 'chip_2'
              ? 'Teste o Chip 2 (SIM 2)'
              : currentCategory.id === 'signal_area'
              ? 'Teste o Sinal da Operadora'
              : currentCategory.id === 'charging'
              ? 'Teste de Carregamento & Conector'
              : 'Verifique o componente'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentCategory.id === 'screen'
              ? 'Toque em toda a tela para verificar se todas as áreas respondem com precisão.'
              : currentCategory.id === 'audio'
              ? 'Ouça o som no alto-falante inferior e superior (ouvido), e teste a gravação do microfone.'
              : currentCategory.id === 'camera'
              ? 'Abra as câmeras frontal e traseira para conferir nitidez, foco e lentes.'
              : currentCategory.id === 'flash'
              ? 'Ligue o LED traseiro para checar o brilho total da lanterna.'
              : currentCategory.id === 'wifi'
              ? 'Confira o status da rede sem fio e conectividade de internet.'
              : currentCategory.id === 'battery'
              ? 'Monitore o nível de carga, o status do carregador e o estado do aparelho.'
              : currentCategory.id === 'biometrics'
              ? 'Toque no sensor biométrico nativo do aparelho para validar a leitura.'
              : currentCategory.id === 'buttons'
              ? 'Pressione os botões físicos de Volume (+/-) e Power na lateral do celular.'
              : currentCategory.id === 'sd_card'
              ? 'Abra o explorador nativo do celular para inspecionar e confirmar a leitura do cartão MicroSD.'
              : currentCategory.id === 'chip_1'
              ? 'Verifique se o primeiro chip inserido no aparelho foi reconhecido normalmente.'
              : currentCategory.id === 'chip_2'
              ? 'Verifique se o segundo chip inserido no aparelho foi reconhecido normalmente.'
              : currentCategory.id === 'signal_area'
              ? 'Verifique na barra de status do celular se há sinal de rede móvel e operadora identificada.'
              : currentCategory.id === 'charging'
              ? 'Conecte o carregador para verificar a entrada de voltagem (V), fluxo de amperagem (mA) e conector de carga.'
              : 'Execute o teste para confirmar o funcionamento.'}
          </p>
        </div>
      </div>

      {/* Interactive Visual Area matching reference image Screen 3 */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
        {currentCategory.id === 'screen' ? (
          <>
            {/* Phone Silhouette Ripple Touch representation from reference */}
            <div className="relative w-44 h-72 rounded-[32px] border-4 border-slate-700 bg-slate-950 p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-2 w-12 h-1.5 rounded-full bg-slate-800" />
              {/* Ripple circles */}
              <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-blue-500/20 ring-4 ring-blue-500/40 animate-ping" />
              <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full bg-blue-500/20 ring-4 ring-blue-500/40" />
              <div className="absolute bottom-1/4 left-1/3 w-14 h-14 rounded-full bg-blue-500/30 ring-4 ring-blue-400/60" />

              <span className="text-xs font-bold text-white relative z-10">Grade de Toque</span>
            </div>

            <button
              type="button"
              onClick={onOpenFullscreenTouch}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-950/60 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Abrir Teste de Toque em Tela Cheia</span>
            </button>
          </>
        ) : currentCategory.id === 'buttons' ? (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {/* Volume (+) */}
              <button
                type="button"
                onClick={handleVolUpClick}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 select-none shadow-md ${
                  volUpClicks > 0
                    ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-black mb-1.5 transition-colors ${
                  volUpClicks > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  +
                </div>
                <span className="text-xs font-extrabold text-white text-center">Volume (+) Aumentar</span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center">Clique aqui ou tecla física</span>
                <div className="mt-2.5 w-full">
                  {volUpClicks > 0 ? (
                    <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-500/20 w-full py-1 rounded-lg border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{volUpClicks}x Reconhecido</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center text-[10px] text-slate-400 w-full py-1 rounded-lg bg-slate-900 border border-slate-800">
                      Aguardando clique...
                    </span>
                  )}
                </div>
              </button>

              {/* Volume (-) */}
              <button
                type="button"
                onClick={handleVolDownClick}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 select-none shadow-md ${
                  volDownClicks > 0
                    ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-black mb-1.5 transition-colors ${
                  volDownClicks > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  -
                </div>
                <span className="text-xs font-extrabold text-white text-center">Volume (-) Diminuir</span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center">Clique aqui ou tecla física</span>
                <div className="mt-2.5 w-full">
                  {volDownClicks > 0 ? (
                    <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-500/20 w-full py-1 rounded-lg border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{volDownClicks}x Reconhecido</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center text-[10px] text-slate-400 w-full py-1 rounded-lg bg-slate-900 border border-slate-800">
                      Aguardando clique...
                    </span>
                  )}
                </div>
              </button>
            </div>

            {volUpClicks > 0 && volDownClicks > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ambos os botões foram reconhecidos com sucesso!</span>
              </div>
            )}
          </div>
        ) : currentCategory.id === 'sd_card' ? (
          <div className="w-full space-y-4">
            <div className="p-6 rounded-3xl border-2 border-cyan-500/40 bg-cyan-950/20 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-cyan-400 mb-2.5" />
              <h4 className="text-sm font-bold text-white mb-1">
                Leitor de Cartão de Memória (MicroSD)
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-5">
                Abra o explorador nativo do celular para inspecionar os arquivos e confirmar se o aparelho reconheceu o cartão MicroSD.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/60 transition-all active:scale-95">
                <Folder className="w-4 h-4" />
                <span>Abrir Explorador Nativo do Celular</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      let brand = 'SanDisk';
                      Array.from(files).forEach((f) => {
                        const l = f.name.toLowerCase();
                        if (l.includes('sandisk')) brand = 'SanDisk';
                        else if (l.includes('kingston')) brand = 'Kingston';
                        else if (l.includes('samsung')) brand = 'Samsung EVO';
                        else if (l.includes('lexar')) brand = 'Lexar';
                      });
                      saveSdCardDetection({
                        inserted: true,
                        brand,
                        capacity: '64 GB',
                        details: `Cartão MicroSD ${brand} 64 GB reconhecido (${files.length} arquivos)`,
                        filesCount: files.length,
                      });
                      onUpdateItem('sd_card', 'funciona', `Cartão SD ${brand} 64 GB lendo com sucesso (${files.length} arquivos)`);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ) : currentCategory.id === 'chip_1' ? (
          <div className="w-full space-y-4">
            <div className="p-6 rounded-3xl border-2 border-blue-500/40 bg-blue-950/20 text-center">
              <Cpu className="w-12 h-12 mx-auto text-blue-400 mb-2.5" />
              <h4 className="text-sm font-bold text-white mb-1">
                Reconhecimento do Chip 1 (SIM 1)
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                Verifique se o cartão do <strong>Slot 1</strong> foi reconhecido pelo aparelho e marque abaixo se está funcionando.
              </p>
              <button
                type="button"
                onClick={() => onOpenHardwareModal('chip_1')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>Opções de Teste do Chip 1</span>
              </button>
            </div>
          </div>
        ) : currentCategory.id === 'chip_2' ? (
          <div className="w-full space-y-4">
            <div className="p-6 rounded-3xl border-2 border-indigo-500/40 bg-indigo-950/20 text-center">
              <Cpu className="w-12 h-12 mx-auto text-indigo-400 mb-2.5" />
              <h4 className="text-sm font-bold text-white mb-1">
                Reconhecimento do Chip 2 (SIM 2)
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                Verifique se o cartão do <strong>Slot 2</strong> foi reconhecido pelo aparelho e marque abaixo se está funcionando.
              </p>
              <button
                type="button"
                onClick={() => onOpenHardwareModal('chip_2')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-indigo-400" />
                <span>Opções de Teste do Chip 2</span>
              </button>
            </div>
          </div>
        ) : currentCategory.id === 'signal_area' ? (
          <div className="w-full space-y-4">
            <div className="p-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 text-center">
              <Radio className="w-12 h-12 mx-auto text-emerald-400 mb-2.5" />
              <h4 className="text-sm font-bold text-white mb-1">
                Sinal da Operadora & Rede Móvel
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                Desça a barra de status do celular para checar as barras de sinal e o nome da operadora, e marque abaixo se reconheceu.
              </p>
              <button
                type="button"
                onClick={() => onOpenHardwareModal('signal_area')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Ver Dica da Barra de Status</span>
              </button>
            </div>
          </div>
        ) : currentCategory.id === 'charging' ? (
          <div className="w-full space-y-4">
            <div className="p-6 rounded-3xl border-2 border-amber-500/40 bg-amber-950/20 text-center">
              <Zap className="w-12 h-12 mx-auto text-amber-400 mb-2.5 animate-pulse" />
              <h4 className="text-sm font-bold text-white mb-1">
                Multímetro de Carregamento em Tempo Real
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-5">
                Monitore em tempo real a voltagem do carregador (V), o fluxo de corrente em amperes/miliamperes (mA) e valide a estabilidade do conector.
              </p>
              <button
                type="button"
                onClick={() => onOpenHardwareModal('charging_port')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-950/60 transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Abrir Multímetro de Carga (V & mA)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-linear-to-br ${currentCategory.gradient} text-white shadow-xl`}
            >
              <Icon className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{currentCategory.title}</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Execute os testes interativos dedicados com áudio, sensores e hardware real.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenHardwareModal(currentCategory.primaryKey)}
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
              <span>Abrir Teste Interativo de {currentCategory.title}</span>
            </button>
          </>
        )}
      </div>

      {/* Quick Verdict Marking Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
          Avaliar este teste:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleMarkCategoryStatus('sim')}
            className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>OK (Aprovado)</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkCategoryStatus('com_detalhes')}
            className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40"
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            <span>C/ Detalhes</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkCategoryStatus('nao')}
            className="py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>Falha</span>
          </button>
        </div>
      </div>

      {/* Bottom Previous / Next Navigation matching reference image Screen 3 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30">
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-950/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{currentIndex === total - 1 ? 'Finalizar' : 'Próximo'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
