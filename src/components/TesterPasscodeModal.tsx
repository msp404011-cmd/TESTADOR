import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, X, CheckCircle2, AlertCircle, Delete } from 'lucide-react';

interface TesterPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requiredCode?: string;
}

export const TesterPasscodeModal: React.FC<TesterPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requiredCode = '1507',
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setError(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (inputCode.length >= 4 || success) return;
    const nextCode = inputCode + digit;
    setInputCode(nextCode);
    setError(false);

    if (nextCode.length === 4) {
      if (nextCode === requiredCode) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        setError(true);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {}
        }
      }
    }
  };

  const handleDelete = () => {
    if (success) return;
    setInputCode((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    if (success) return;
    setInputCode('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-xs rounded-3xl border bg-slate-900 p-6 shadow-2xl text-slate-100 transition-all ${
        error
          ? 'border-rose-500/80 ring-2 ring-rose-500/40 animate-bounce'
          : success
          ? 'border-emerald-500 ring-2 ring-emerald-500/40'
          : 'border-slate-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {success ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Acesso ao Testador</h3>
              <p className="text-[11px] text-slate-400">Senha Super Secreta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Display */}
        <div className="my-5 text-center">
          <div className="flex justify-center gap-3 mb-3">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = inputCode.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl border flex items-center justify-center text-xl font-mono font-bold transition-all shadow-inner ${
                    isFilled
                      ? error
                        ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                        : success
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-blue-500 bg-blue-950/40 text-blue-300 scale-105'
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {error ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>Senha incorreta! Tente novamente.</span>
            </div>
          ) : success ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Senha correta! Acesso liberado.</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Digite os 4 dígitos para acessar</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-lg font-mono font-bold text-slate-200 border border-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            Limpar
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-lg font-mono font-bold text-slate-200 border border-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Apagar último dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Secret passcode notice for technician ease */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            🔒 Proteção de Segurança Ativa (Senha: 1507)
          </span>
        </div>
      </div>
    </div>
  );
};
