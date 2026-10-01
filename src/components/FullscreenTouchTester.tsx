import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface FullscreenTouchTesterProps {
  isOpen: boolean;
  onClose: (result: { status: 'sim' | 'mau_toque' | 'nao'; observation: string }) => void;
}

export const FullscreenTouchTester: React.FC<FullscreenTouchTesterProps> = ({
  isOpen,
  onClose,
}) => {
  const [cols, setCols] = useState(12);
  const [rows, setRows] = useState(20);
  const [touchedCells, setTouchedCells] = useState<Set<number>>(new Set());
  const [exitClicks, setExitClicks] = useState(0);
  const [showExitHint, setShowExitHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const exitTimeoutRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);

  const totalCells = cols * rows;

  // Calculate dynamic rows & cols to cover screen aspect ratio
  useEffect(() => {
    if (!isOpen) {
      hasFinishedRef.current = false;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          // ignore
        }
      }
      return;
    }

    hasFinishedRef.current = false;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cellTargetSize = 44; // px for each touch cell

    const calculatedCols = Math.max(8, Math.floor(width / cellTargetSize));
    const calculatedRows = Math.max(12, Math.floor(height / cellTargetSize));

    setCols(calculatedCols);
    setRows(calculatedRows);
    setTouchedCells(new Set());
    setExitClicks(0);

    // Attempt native browser fullscreen if allowed
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen not permitted by user gesture
    }

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen]);

  // Touch handlers
  const markCell = (index: number) => {
    setTouchedCells((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.hasAttribute('data-cell-idx')) {
      const idx = Number(el.getAttribute('data-cell-idx'));
      markCell(idx);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el.hasAttribute('data-cell-idx')) {
        const idx = Number(el.getAttribute('data-cell-idx'));
        markCell(idx);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.hasAttribute('data-cell-idx')) {
        const idx = Number(el.getAttribute('data-cell-idx'));
        markCell(idx);
      }
    }
  };

  // Check if 100% complete
  useEffect(() => {
    if (isOpen && totalCells > 0 && touchedCells.size >= totalCells && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      // Stop any vibration immediately (never vibrate constantly)
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          // ignore
        }
      }
      // Exit fullscreen if active
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      onClose({
        status: 'sim',
        observation: '100% da tela testada em tela cheia - Touch perfeito sem pontos mortos',
      });
    }
  }, [touchedCells.size, totalCells, isOpen, onClose]);

  // Emergency Exit Button: MUST BE CLICKED 3 TIMES
  const handleExitClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Mark the top right cell underneath as well
    markCell(cols - 1);

    const nextClicks = exitClicks + 1;
    setExitClicks(nextClicks);
    setShowExitHint(true);

    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = window.setTimeout(() => {
      setExitClicks(0);
      setShowExitHint(false);
    }, 2500);

    if (nextClicks >= 3) {
      // Exit confirmed after 3 intentional clicks!
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          // ignore
        }
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      const percentage = Math.round((touchedCells.size / totalCells) * 100);
      onClose({
        status: percentage >= 80 ? 'mau_toque' : 'nao',
        observation: `Teste em tela cheia interrompido (${percentage}% da tela testada). Verificado falha em área não coberta.`,
      });
    }
  };

  if (!isOpen) return null;

  const percentage = totalCells > 0 ? Math.round((touchedCells.size / totalCells) * 100) : 0;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
      className="fixed inset-0 z-[99999] bg-black select-none touch-none flex flex-col cursor-crosshair overflow-hidden"
    >
      {/* ONLY ONE X BUTTON ON THE TOP RIGHT CORNER (Requires 3 intentional taps to exit) */}
      <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
        {showExitHint && (
          <span className="text-xs font-semibold bg-rose-950/95 text-rose-200 border border-rose-600 px-3 py-1.5 rounded-lg shadow-2xl animate-pulse">
            {exitClicks === 1 && 'Toque mais 2x no [X] para sair'}
            {exitClicks === 2 && 'Toque mais 1x no [X] para sair'}
          </span>
        )}

        <button
          type="button"
          onClick={handleExitClick}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl border font-bold text-sm transition-all active:scale-90 ${
            exitClicks > 0
              ? 'bg-rose-600 border-rose-300 text-white shadow-lg shadow-rose-900/80 ring-2 ring-rose-400'
              : 'bg-black/70 border-slate-700/80 text-slate-400 hover:text-white backdrop-blur-xs'
          }`}
          title="Clique 3 vezes seguidas para sair sem concluir 100%"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
          {exitClicks > 0 && (
            <span className="absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-rose-700 shadow-md">
              {exitClicks}/3
            </span>
          )}
        </button>
      </div>

      {/* FULLSCREEN TOUCH GRID MATRIX - 100% of the screen */}
      <div
        className="flex-1 w-full h-full grid p-0.5 gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isFilled = touchedCells.has(idx);
          return (
            <div
              key={idx}
              data-cell-idx={idx}
              onPointerDown={() => markCell(idx)}
              className={`transition-colors duration-75 select-none rounded-[2px] ${
                isFilled
                  ? 'bg-emerald-500 shadow-xs shadow-emerald-500/80'
                  : 'bg-slate-900/90 border border-slate-800/60'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
