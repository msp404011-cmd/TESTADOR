import React, { useState } from 'react';
import {
  ChecklistItemKey,
  ChecklistRecord,
  ChecklistItemState,
} from '../types/order';
import { CHECKLIST_ITEMS, createDefaultChecklist, createEmptyChecklist } from '../data/initialChecklist';
import {
  Power,
  Touchpad,
  Zap,
  Wifi,
  Camera,
  Mic,
  Volume2,
  PlusCircle,
  MinusCircle,
  Fingerprint,
  Sliders,
  Inbox,
  CreditCard,
  Cpu,
  Signal,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

interface ChecklistSectionProps {
  checklist: ChecklistRecord;
  checklistType: 'entry' | 'exit';
  onChangeChecklistType: (type: 'entry' | 'exit') => void;
  onUpdateItem: (key: ChecklistItemKey, partial: Partial<ChecklistItemState>) => void;
  onBulkUpdate: (newRecord: ChecklistRecord) => void;
  onOpenTester: (testKey?: ChecklistItemKey) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Power,
  Touchpad,
  Zap,
  Wifi,
  Camera,
  Mic,
  Volume2,
  PlusCircle,
  MinusCircle,
  Fingerprint,
  Sliders,
  Inbox,
  CreditCard,
  Cpu,
  Signal,
};

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklist,
  checklistType,
  onChangeChecklistType,
  onUpdateItem,
  onBulkUpdate,
  onOpenTester,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'ok' | 'warning' | 'error' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const totalItems = CHECKLIST_ITEMS.length;
  let okCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let pendingCount = 0;

  CHECKLIST_ITEMS.forEach((item) => {
    const state = checklist[item.key];
    if (!state || !state.status) {
      pendingCount++;
      return;
    }

    if (item.hasPresenceToggle && state.hasItem === false) {
      okCount++;
      return;
    }

    const opt = item.options.find((o) => o.id === state.status);
    if (opt) {
      if (opt.tone === 'success' || opt.tone === 'neutral') okCount++;
      else if (opt.tone === 'warning') warningCount++;
      else if (opt.tone === 'danger') errorCount++;
    } else {
      pendingCount++;
    }
  });

  // Filter items
  const filteredItems = CHECKLIST_ITEMS.filter((item) => {
    const state = checklist[item.key] || { status: '', observation: '' };
    const opt = item.options.find((o) => o.id === state.status);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      const matchObs = state.observation?.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchObs) return false;
    }

    if (filterMode === 'ok') {
      if (item.hasPresenceToggle && state.hasItem === false) return true;
      return opt && (opt.tone === 'success' || opt.tone === 'neutral');
    }
    if (filterMode === 'warning') {
      return opt && opt.tone === 'warning';
    }
    if (filterMode === 'error') {
      return opt && opt.tone === 'danger';
    }
    if (filterMode === 'pending') {
      return !state.status;
    }
    return true;
  });

  const handleQuickNoteClick = (key: ChecklistItemKey, note: string) => {
    const current = checklist[key]?.observation || '';
    if (!current) {
      onUpdateItem(key, { observation: note });
    } else if (!current.includes(note)) {
      onUpdateItem(key, { observation: `${current}, ${note}` });
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
      {/* SECTION HEADER */}
      <div className="p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Ordem de Serviço · Bancada Técnica
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">Inspeção Obrigatória</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">Setor de Checklist do Aparelho</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Avaliação de 17 pontos vitais com botões de acionamento imediato e observações técnicas
            </p>
          </div>

          {/* Action cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Entry / Exit Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeChecklistType('entry')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  checklistType === 'entry'
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Entrada (Recebimento)
              </button>
              <button
                type="button"
                onClick={() => onChangeChecklistType('exit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  checklistType === 'exit'
                    ? 'bg-slate-800 text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Saída (Pós-Reparo)
              </button>
            </div>

            {/* Mark all OK button */}
            <button
              type="button"
              onClick={() => onBulkUpdate(createDefaultChecklist())}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 transition-colors whitespace-nowrap"
              title="Preenche todos os 17 itens como Aprovados / Normais"
            >
              <Check className="w-3.5 h-3.5" />
              Marcar Todos como OK
            </button>

            {/* Clear checklist button */}
            <button
              type="button"
              onClick={() => onBulkUpdate(createEmptyChecklist())}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
              title="Limpa todas as respostas do checklist"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>
        </div>

        {/* METRICS & QUICK FILTER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-800/80">
          {/* Status summary pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>Todos</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
                {totalItems}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('ok')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'ok'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Aprovados</span>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">{okCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('warning')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'warning'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>C/ Ressalvas</span>
              <span className="font-mono text-[11px] text-amber-400 font-semibold">{warningCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('error')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'error'
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-700/60'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Não Funciona</span>
              <span className="font-mono text-[11px] text-rose-400 font-semibold">{errorCount}</span>
            </button>

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterMode === 'pending'
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <span>Pendentes</span>
                <span className="font-mono text-[11px] text-slate-400">{pendingCount}</span>
              </button>
            )}
          </div>

          {/* Search bar inside checklist */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar item ou observação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="divide-y divide-slate-800/80">
        {filteredItems.map((item, index) => {
          const itemKey = item.key;
          const currentState = checklist[itemKey] || { status: '', observation: '' };
          const IconComponent = ICON_MAP[item.iconName] || Power;
          const hasPresence = item.hasPresenceToggle;
          const currentPresence = currentState.hasItem !== false;

          return (
            <div
              key={itemKey}
              className="p-4 sm:p-5 hover:bg-slate-850/40 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left zone: Item identity & context */}
                <div className="lg:w-1/3 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      <IconComponent className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {(index + 1).toString().padStart(2, '0')}.
                        </span>
                        <h3 className="text-sm font-semibold text-slate-200 truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {item.subtitle}
                      </p>

                      {/* Interactive real-time test button trigger */}
                      {item.testType && (
                        <button
                          type="button"
                          onClick={() => onOpenTester(item.key)}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 shadow-xs transition-all active:scale-97 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>
                            {item.key === 'wifi'
                              ? 'Ver Status & Redes Wi-Fi'
                              : item.key === 'volume_up' || item.key === 'volume_down'
                              ? 'Testar Botões de Volume (+ / -)'
                              : item.key === 'biometrics'
                              ? 'Testar Leitor da Digital'
                              : item.key === 'sd_card'
                              ? 'Ler Memória Real & Cartão SD'
                              : item.key === 'chip_1' || item.key === 'chip_2' || item.key === 'signal_area'
                              ? 'Abrir Gerenciador de Chips & Configurações'
                              : item.key === 'touch_screen'
                              ? 'Abrir Teste em Tela Cheia (100% da Tela)'
                              : item.key === 'microphone'
                              ? 'Gravar & Testar Microfone'
                              : item.key === 'audio'
                              ? 'Testar Alto-falantes (Máx) & Auricular Ouvido'
                              : item.key === 'front_camera' || item.key === 'rear_camera'
                              ? 'Abrir Câmera em Máxima Resolução'
                              : item.key === 'flash'
                              ? 'Ligar Flash LED Físico do Celular'
                              : 'Testar no Aparelho'}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right zone: Presence toggle, Option Buttons & Observation */}
                <div className="lg:w-2/3 flex flex-col gap-3">
                  {/* Presence toggle for Biometria & Botão Auxiliar */}
                  {hasPresence && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Presença no Aparelho:</span>
                      <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => onUpdateItem(itemKey, { hasItem: true })}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            currentPresence
                              ? 'bg-slate-800 text-emerald-400 font-semibold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          TEM
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem(itemKey, {
                              hasItem: false,
                              status: 'nao_possui',
                              observation: 'Aparelho não possui este componente',
                            })
                          }
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            !currentPresence
                              ? 'bg-slate-800 text-slate-300 font-semibold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          NÃO TEM
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CLICKABLE STATUS BUTTONS */}
                  {(!hasPresence || currentPresence) && (
                    <div className="flex flex-wrap gap-2">
                      {item.options.map((option) => {
                        const isSelected = currentState.status === option.id;
                        let activeClasses = '';

                        if (isSelected) {
                          if (option.tone === 'success') {
                            activeClasses =
                              'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm shadow-emerald-900/40 ring-1 ring-emerald-400';
                          } else if (option.tone === 'danger') {
                            activeClasses =
                              'bg-rose-600 text-white font-semibold border-rose-500 shadow-sm shadow-rose-900/40 ring-1 ring-rose-400';
                          } else if (option.tone === 'warning') {
                            activeClasses =
                              'bg-amber-600 text-white font-semibold border-amber-500 shadow-sm shadow-amber-900/40 ring-1 ring-amber-400';
                          } else {
                            activeClasses =
                              'bg-slate-700 text-slate-100 font-semibold border-slate-600 shadow-sm';
                          }
                        } else {
                          activeClasses =
                            'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-850';
                        }

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onUpdateItem(itemKey, { status: option.id })}
                            title={option.description}
                            className={`px-3.5 py-2 rounded-lg text-xs tracking-wide border transition-all whitespace-nowrap active:scale-97 cursor-pointer ${activeClasses}`}
                          >
                            <span className="uppercase">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* OBSERVATION SPACE */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Espaço de Observação Técnica:</span>
                      {currentState.observation && (
                        <button
                          type="button"
                          onClick={() => onUpdateItem(itemKey, { observation: '' })}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          Limpar campo
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={currentState.observation}
                      onChange={(e) => onUpdateItem(itemKey, { observation: e.target.value })}
                      placeholder={`Ex: Detalhes, avarias ou comportamento de ${item.title.toLowerCase()}...`}
                      className="w-full px-3 py-2 text-xs bg-slate-950/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />

                    {/* Quick suggestion tags */}
                    {item.quickNotes && item.quickNotes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-500">Sugestões rápidas:</span>
                        {item.quickNotes.map((note) => (
                          <button
                            key={note}
                            type="button"
                            onClick={() => handleQuickNoteClick(itemKey, note)}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            + {note}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhum item corresponde ao filtro selecionado ({filterMode}).
          </div>
        )}
      </div>
    </section>
  );
};
