import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-2xl animate-fade-in border border-amber-400/40">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Modo Offline Ativo — Os testes e recursos continuam funcionando localmente.</span>
    </div>
  );
};
