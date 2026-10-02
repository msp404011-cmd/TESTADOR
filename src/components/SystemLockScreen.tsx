import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface SystemLockScreenProps {
  onUnlock: () => void;
  requiredPassword?: string;
}

export const SystemLockScreen: React.FC<SystemLockScreenProps> = ({
  onUnlock,
  requiredPassword = '1507mm',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(false);

    if (password.trim() === requiredPassword) {
      setSuccess(true);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {}
      }
      setTimeout(() => {
        onUnlock();
      }, 400);
    } else {
      setError(true);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([150, 80, 150]);
        } catch {}
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 sm:p-6 backdrop-blur-xl animate-fade-in select-none">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative w-full max-w-sm rounded-3xl border bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100 transition-all ${
        error
          ? 'border-rose-500/80 ring-2 ring-rose-500/40 animate-bounce'
          : success
          ? 'border-emerald-500 ring-2 ring-emerald-500/40'
          : 'border-slate-800 hover:border-slate-700'
      }`}>
        {/* Brand Icon & Lock Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
            success
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 scale-110'
              : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
          }`}>
            {success ? (
              <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
            ) : (
              <Lock className="w-8 h-8 stroke-[2.2]" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Acesso do Sistema
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Digite a senha para acessar o aplicativo
            </p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <KeyRound className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Digite a senha..."
              className={`w-full pl-10 pr-12 py-3.5 text-sm font-mono rounded-2xl bg-slate-950 border text-slate-100 placeholder-slate-600 focus:outline-hidden transition-all shadow-inner ${
                error
                  ? 'border-rose-500/80 bg-rose-950/20 text-rose-200'
                  : success
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-200'
                  : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="flex items-center gap-1.5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Senha incorreta! Tente novamente.</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Acesso liberado! Entrando...</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!password || success}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              success
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/60 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <span>{success ? 'Acesso Concedido' : 'Acessar o Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] font-mono text-slate-500">
            🔒 Proteção de Sistema • Senha Ativa
          </p>
        </div>
      </div>
    </div>
  );
};
