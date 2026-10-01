import React, { useState } from 'react';
import { X, Download, Share2, Eye, CheckCircle2, Smartphone, Image as ImageIcon } from 'lucide-react';

interface TestImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  onSaveToGallery?: () => void;
}

export const TestImagePreviewModal: React.FC<TestImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !imageDataUrl) return null;

  const handleDownloadOrSave = async () => {
    try {
      // 1. Try mobile Web Share API first for direct photo gallery saving
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `laudo-teste-celular-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Laudo de Teste do Celular',
          text: 'Comprovante do teste de bancada do aparelho.',
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        return;
      }
    } catch {
      // ignore and fallback to direct download
    }

    // Direct Browser Download
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `laudo-teste-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      handleDownloadOrSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Visualização do Laudo de Teste
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Pronto para Galeria
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Confira a imagem gerada antes de salvar na galeria do seu celular.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Image Preview Zone */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 flex items-center justify-center">
          <div className="max-w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={imageDataUrl}
              alt="Laudo do Teste"
              className="w-full h-auto object-contain max-h-[60vh] select-none pointer-events-auto rounded-xl"
            />
          </div>
        </div>

        {/* Saved Toast Bar */}
        {savedSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Imagem salva com sucesso! Verifique na sua galeria / downloads.</span>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Voltar ao Checklist
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyImage}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{copied ? 'Copiado!' : 'Copiar Imagem'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadOrSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Salvar na Galeria do Celular</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
