import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone PWA full-screen mode, hide install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General browser fallback guide
      setShowIOSGuide(true);
    }
  };

  // Header Button Variant
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition-all active:scale-95 whitespace-nowrap cursor-pointer shadow-xs"
          title="Instalar aplicativo na tela inicial do celular"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">Instalar</span>
        </button>

        {/* iOS / Fallback Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar no Celular</h3>
                  <p className="text-xs text-slate-400">Adicionar à Tela Inicial (PWA)</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                    <Share className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white">1. Abra o menu do navegador</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      No iPhone (Safari), toque no ícone <strong>Compartilhar</strong> (quadrado com seta). No Android (Chrome), toque nos <strong>3 pontinhos</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                  <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white">2. Adicionar à Tela de Início</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> ou <strong>"Instalar aplicativo"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Floating Banner Variant (Bottom of mobile screen)
  return (
    <>
      <div className="no-print fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instalar TechCheck Celular</h4>
            <p className="text-[11px] text-slate-400">Rode direto da tela inicial em tela cheia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instalar no Celular</h3>
                <p className="text-xs text-slate-400">Adicionar à Tela Inicial (PWA)</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white">1. Abra o menu do navegador</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    No iPhone (Safari), toque no ícone <strong>Compartilhar</strong>. No Android (Chrome), toque nos <strong>3 pontinhos</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white">2. Adicionar à Tela de Início</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Role e toque em <strong>"Adicionar à Tela de Início"</strong> ou <strong>"Instalar aplicativo"</strong>.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
