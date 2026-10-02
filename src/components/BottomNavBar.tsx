import React from 'react';
import { Home, PlayCircle, FileText } from 'lucide-react';

export type MainNavTab = 'home' | 'tests' | 'results';

interface BottomNavBarProps {
  currentTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  testedCount: number;
  totalCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onChangeTab,
  testedCount,
  totalCount,
}) => {
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-4 py-2">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Início */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-blue-400 bg-blue-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs leading-tight">Início</span>
        </button>

        {/* Testes */}
        <button
          type="button"
          onClick={() => onChangeTab('tests')}
          className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer relative ${
            currentTab === 'tests'
              ? 'text-blue-400 bg-blue-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-5 h-5 mb-1" />
          <span className="text-xs leading-tight">Testes</span>
        </button>

        {/* Relatório / Resultado */}
        <button
          type="button"
          onClick={() => onChangeTab('results')}
          className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer relative ${
            currentTab === 'results'
              ? 'text-blue-400 bg-blue-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-xs leading-tight">Relatório</span>
          {testedCount > 0 && (
            <span className="absolute top-2 right-8 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          )}
        </button>
      </div>
    </nav>
  );
};
