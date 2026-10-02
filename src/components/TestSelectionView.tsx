import React, { useState } from 'react';
import { CATEGORY_CARDS, CategoryCardConfig } from './CategoryTestCards';
import { ArrowLeft, Check, Play, CheckSquare, Square } from 'lucide-react';
import { ChecklistItemKey } from '../types/order';

interface TestSelectionViewProps {
  onBack: () => void;
  onStartSelected: (selectedCategories: CategoryCardConfig[]) => void;
}

export const TestSelectionView: React.FC<TestSelectionViewProps> = ({
  onBack,
  onStartSelected,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    CATEGORY_CARDS.map((c) => c.id)
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === CATEGORY_CARDS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(CATEGORY_CARDS.map((c) => c.id));
    }
  };

  const toggleCard = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    const selected = CATEGORY_CARDS.filter((c) => selectedIds.includes(c.id));
    if (selected.length > 0) {
      onStartSelected(selected);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-20">
      {/* Header matching reference image Screen 2 */}
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
            <h2 className="text-base font-extrabold text-white">Selecionar Testes</h2>
            <p className="text-xs text-slate-400">Escolha os testes que deseja executar</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSelectAll}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
        >
          {selectedIds.length === CATEGORY_CARDS.length ? (
            <>
              <CheckSquare className="w-4 h-4" />
              <span>Desmarcar todos</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              <span>Marcar todos</span>
            </>
          )}
        </button>
      </div>

      {/* Selectable Test Cards List matching reference image */}
      <div className="space-y-2.5">
        {CATEGORY_CARDS.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => toggleCard(cat.id)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? 'bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center bg-linear-to-br ${cat.gradient} text-white shadow-xs shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{cat.title}</h4>
                  <p className="text-xs text-slate-400">{cat.subtitle}</p>
                </div>
              </div>

              {/* Blue Checkbox matching reference image */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'border-2 border-slate-700 bg-slate-800'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Launch Button matching reference image */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30">
        <div className="max-w-xl mx-auto">
          <button
            type="button"
            onClick={handleStart}
            disabled={selectedIds.length === 0}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-blue-950/60 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar testes selecionados ({selectedIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
