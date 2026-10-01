import React, { useState, useRef } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface PatternUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPattern?: number[];
  onSavePattern: (nodes: number[]) => void;
}

export const PatternUnlockModal: React.FC<PatternUnlockModalProps> = ({
  isOpen,
  onClose,
  initialPattern = [],
  onSavePattern,
}) => {
  const [pattern, setPattern] = useState<number[]>(initialPattern);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleNodeTouch = (index: number) => {
    if (!pattern.includes(index)) {
      setPattern((prev) => [...prev, index]);
    }
  };

  const handlePointerDown = (index: number) => {
    setIsDrawing(true);
    setPattern([index]);
  };

  const handlePointerEnter = (index: number) => {
    if (isDrawing && !pattern.includes(index)) {
      setPattern((prev) => [...prev, index]);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    onSavePattern(pattern);
    onClose();
  };

  const handleReset = () => {
    setPattern([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-100">Padrão de Desbloqueio</h3>
            <p className="text-xs text-slate-400">Desenhe ligando os 9 pontos</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={containerRef}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="my-6 relative mx-auto grid w-64 h-64 grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 select-none touch-none"
        >
          {/* SVG Connecting lines between nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {pattern.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pattern
                  .map((idx) => {
                    const row = Math.floor(idx / 3);
                    const col = idx % 3;
                    // Grid size is 256x256, padding is 16px, cells are spaced evenly
                    const x = 16 + col * 75 + 37.5;
                    const y = 16 + row * 75 + 37.5;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>

          {Array.from({ length: 9 }).map((_, idx) => {
            const isSelected = pattern.includes(idx);
            const orderIndex = pattern.indexOf(idx);

            return (
              <div
                key={idx}
                onPointerDown={() => handlePointerDown(idx)}
                onPointerEnter={() => handlePointerEnter(idx)}
                onTouchStart={() => handleNodeTouch(idx)}
                className="relative z-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              >
                <div
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                      : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      isSelected ? 'bg-emerald-400 scale-125' : 'bg-slate-500'
                    }`}
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                      {orderIndex + 1}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-slate-400 mb-6 font-mono">
          Sequência:{' '}
          {pattern.length > 0 ? (
            <span className="text-emerald-400 font-semibold">{pattern.map((p) => p + 1).join(' → ')}</span>
          ) : (
            <span className="text-slate-500">Nenhum ponto selecionado</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Salvar Padrão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
