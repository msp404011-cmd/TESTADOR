import React from 'react';
import {
  Printer,
  Share2,
  FolderOpen,
  Plus,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'checklist' | 'order_info' | 'summary';
  setActiveTab: (tab: 'checklist' | 'order_info' | 'summary') => void;
  onNewOrder: () => void;
  onOpenHistory: () => void;
  onPrint: () => void;
  onShareWhatsApp: () => void;
  onOpenTester: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewOrder,
  onOpenHistory,
  onPrint,
  onShareWhatsApp,
  onOpenTester,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('checklist');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
        >
          TechCheck OS
        </a>
      </div>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'text-emerald-400 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-500'
              : 'hover:text-slate-200'
          }`}
        >
          Setor Checklist (17 Itens)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('order_info')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'order_info'
              ? 'text-emerald-400 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-500'
              : 'hover:text-slate-200'
          }`}
        >
          Dados da OS & Aparelho
        </button>

        <button
          type="button"
          onClick={onOpenTester}
          className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Laboratório de Teste</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Ordens Salvas</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
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
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap border border-slate-700"
          title="Imprimir Ordem de Serviço em A4 ou PDF"
        >
          <Printer className="w-3.5 h-3.5 text-blue-400" />
          <span>Imprimir OS</span>
        </button>

        <button
          type="button"
          onClick={onNewOrder}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova OS</span>
        </button>
      </div>
    </header>
  );
};
