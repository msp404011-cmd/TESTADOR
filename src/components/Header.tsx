import React, { useState } from 'react';
import {
  Menu,
  RotateCcw,
  Image as ImageIcon,
  Share2,
  X,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onResetTest: () => void;
  onGenerateImage: () => void;
  onShareWhatsApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetTest,
  onGenerateImage,
  onShareWhatsApp,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 py-3 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      {/* Left: Menu Hamburger matching reference image */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
          title="Menu de opções"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center/Title matching reference image Screen 1 */}
        <div className="text-left min-w-0">
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
            Teste de Celular
          </h1>
          <p className="text-[11px] text-slate-400 truncate leading-none mt-0.5">
            Diagnóstico completo do seu aparelho
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* PWA Install Button */}
        <PWAInstallButton variant="header" />

        <button
          type="button"
          onClick={onGenerateImage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-950/50 active:scale-95 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gerar Laudo</span>
          <span className="sm:hidden">Laudo</span>
        </button>

        <button
          type="button"
          onClick={onResetTest}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
          title="Limpar e reiniciar testes"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-start p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-72 max-w-full rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3 mt-12 text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Opções Rápidas</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onGenerateImage();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-left cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Gerar Imagem do Laudo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onShareWhatsApp();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-left cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Compartilhar no WhatsApp</span>
              </button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onResetTest();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-950/40 text-rose-300 text-left cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Limpar e Reiniciar Testes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
