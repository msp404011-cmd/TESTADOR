import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';

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
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              TechCheck Celular
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                Bancada de Testes
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Direct primary actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onResetTest}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap border border-slate-700"
          title="Limpar todos os campos e iniciar novo teste"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Limpar Testes</span>
        </button>

        <button
          type="button"
          onClick={onShareWhatsApp}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap border border-slate-700"
          title="Copiar relatório formatado para WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={onGenerateImage}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-emerald-950/50 active:scale-95 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Gerar Imagem do Teste</span>
        </button>
      </div>
    </header>
  );
};
