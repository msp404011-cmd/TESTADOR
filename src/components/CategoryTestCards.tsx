import React from 'react';
import { ChecklistRecord, ChecklistItemKey } from '../types/order';
import {
  Smartphone,
  Volume2,
  Camera,
  Wifi,
  Zap,
  Battery,
  Fingerprint,
  Sliders,
  Cpu,
  CreditCard,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export interface CategoryCardConfig {
  id: string;
  title: string;
  subtitle: string;
  keys: ChecklistItemKey[];
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderGlow: string;
  accentBg: string;
  primaryKey: ChecklistItemKey;
}

export const CATEGORY_CARDS: CategoryCardConfig[] = [
  {
    id: 'screen',
    title: 'Tela',
    subtitle: 'Toque e cores',
    keys: ['touch_screen'],
    icon: Smartphone,
    gradient: 'from-emerald-600 to-emerald-500',
    borderGlow: 'border-emerald-500/40 hover:border-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300',
    primaryKey: 'touch_screen',
  },
  {
    id: 'audio',
    title: 'Áudio',
    subtitle: 'Alto-falante e microfone',
    keys: ['audio', 'microphone'],
    icon: Volume2,
    gradient: 'from-blue-600 to-blue-500',
    borderGlow: 'border-blue-500/40 hover:border-blue-400',
    accentBg: 'bg-blue-500/20 text-blue-300',
    primaryKey: 'audio',
  },
  {
    id: 'camera',
    title: 'Câmeras',
    subtitle: 'Frontal e traseira',
    keys: ['front_camera', 'rear_camera'],
    icon: Camera,
    gradient: 'from-purple-600 to-purple-500',
    borderGlow: 'border-purple-500/40 hover:border-purple-400',
    accentBg: 'bg-purple-500/20 text-purple-300',
    primaryKey: 'front_camera',
  },
  {
    id: 'wifi',
    title: 'Wi-Fi',
    subtitle: 'Rede sem fio',
    keys: ['wifi'],
    icon: Wifi,
    gradient: 'from-amber-600 to-amber-500',
    borderGlow: 'border-amber-500/40 hover:border-amber-400',
    accentBg: 'bg-amber-500/20 text-amber-300',
    primaryKey: 'wifi',
  },
  {
    id: 'flash',
    title: 'Lanterna',
    subtitle: 'Flash LED físico',
    keys: ['flash'],
    icon: Zap,
    gradient: 'from-rose-600 to-rose-500',
    borderGlow: 'border-rose-500/40 hover:border-rose-400',
    accentBg: 'bg-rose-500/20 text-rose-300',
    primaryKey: 'flash',
  },
  {
    id: 'battery',
    title: 'Bateria',
    subtitle: 'Carga e saúde',
    keys: [],
    icon: Battery,
    gradient: 'from-slate-700 to-slate-600',
    borderGlow: 'border-slate-600/50 hover:border-slate-500',
    accentBg: 'bg-slate-700/40 text-slate-300',
    primaryKey: 'battery' as any,
  },
  {
    id: 'biometrics',
    title: 'Biometria',
    subtitle: 'Digital e sensor',
    keys: ['biometrics'],
    icon: Fingerprint,
    gradient: 'from-indigo-600 to-indigo-500',
    borderGlow: 'border-indigo-500/40 hover:border-indigo-400',
    accentBg: 'bg-indigo-500/20 text-indigo-300',
    primaryKey: 'biometrics',
  },
  {
    id: 'buttons',
    title: 'Botões Físicos',
    subtitle: 'Volume (+/-) e Power',
    keys: ['power_button', 'volume_up', 'volume_down', 'aux_button'],
    icon: Sliders,
    gradient: 'from-pink-600 to-pink-500',
    borderGlow: 'border-pink-500/40 hover:border-pink-400',
    accentBg: 'bg-pink-500/20 text-pink-300',
    primaryKey: 'volume_up',
  },
  {
    id: 'sd_card',
    title: 'Cartão de Memória',
    subtitle: 'Abrir explorador nativo',
    keys: ['sd_card'],
    icon: CreditCard,
    gradient: 'from-cyan-600 to-cyan-500',
    borderGlow: 'border-cyan-500/40 hover:border-cyan-400',
    accentBg: 'bg-cyan-500/20 text-cyan-300',
    primaryKey: 'sd_card',
  },
  {
    id: 'chip_1',
    title: 'Chip 1 (SIM 1)',
    subtitle: 'Marcar se reconheceu',
    keys: ['chip_1'],
    icon: Cpu,
    gradient: 'from-blue-600 to-blue-500',
    borderGlow: 'border-blue-500/40 hover:border-blue-400',
    accentBg: 'bg-blue-500/20 text-blue-300',
    primaryKey: 'chip_1',
  },
  {
    id: 'chip_2',
    title: 'Chip 2 (SIM 2)',
    subtitle: 'Marcar se reconheceu',
    keys: ['chip_2'],
    icon: Cpu,
    gradient: 'from-indigo-600 to-indigo-500',
    borderGlow: 'border-indigo-500/40 hover:border-indigo-400',
    accentBg: 'bg-indigo-500/20 text-indigo-300',
    primaryKey: 'chip_2',
  },
  {
    id: 'signal_area',
    title: 'Sinal de Operadora',
    subtitle: 'Marcar se reconhece',
    keys: ['signal_area'],
    icon: Radio,
    gradient: 'from-emerald-600 to-emerald-500',
    borderGlow: 'border-emerald-500/40 hover:border-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300',
    primaryKey: 'signal_area',
  },
  {
    id: 'charging',
    title: 'Carregamento',
    subtitle: 'Volts e amperes em tempo real',
    keys: ['charging_port'],
    icon: Zap,
    gradient: 'from-amber-600 to-amber-500',
    borderGlow: 'border-amber-500/40 hover:border-amber-400',
    accentBg: 'bg-amber-500/20 text-amber-300',
    primaryKey: 'charging_port',
  },
];

interface CategoryTestCardsProps {
  checklist: ChecklistRecord;
  onOpenTest: (key: ChecklistItemKey) => void;
  batteryStatusText?: string;
}

export const CategoryTestCards: React.FC<CategoryTestCardsProps> = ({
  checklist,
  onOpenTest,
  batteryStatusText,
}) => {
  const getCategoryStatus = (cat: CategoryCardConfig) => {
    if (cat.id === 'battery') {
      return {
        label: batteryStatusText || 'Detectada',
        tone: 'success' as const,
        icon: CheckCircle2,
      };
    }

    if (cat.keys.length === 0) {
      return { label: 'Pendente', tone: 'neutral' as const, icon: null };
    }

    let testedCount = 0;
    let failedCount = 0;
    let detailsCount = 0;

    cat.keys.forEach((key) => {
      const state = checklist[key];
      if (state && state.status) {
        testedCount++;
        if (
          state.status === 'nao' ||
          state.status === 'nao_funciona' ||
          state.status === 'nao_area'
        ) {
          failedCount++;
        } else if (
          state.status === 'com_detalhes' ||
          state.status === 'com_dificuldade' ||
          state.status === 'mau_toque'
        ) {
          detailsCount++;
        }
      }
    });

    if (testedCount === 0) {
      return { label: 'Não testado', tone: 'neutral' as const, icon: null };
    }

    if (failedCount > 0) {
      return {
        label: `${failedCount} com falha`,
        tone: 'danger' as const,
        icon: XCircle,
      };
    }

    if (detailsCount > 0) {
      return {
        label: 'Atenção',
        tone: 'warning' as const,
        icon: AlertTriangle,
      };
    }

    if (testedCount === cat.keys.length) {
      return {
        label: 'OK',
        tone: 'success' as const,
        icon: CheckCircle2,
      };
    }

    return {
      label: `${testedCount}/${cat.keys.length} OK`,
      tone: 'success' as const,
      icon: CheckCircle2,
    };
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Testes por categoria</h3>
        <span className="text-[11px] text-slate-400">9 categorias de hardware</span>
      </div>

      {/* 3x3 Card Grid matching reference image */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {CATEGORY_CARDS.map((cat) => {
          const Icon = cat.icon;
          const status = getCategoryStatus(cat);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onOpenTest(cat.primaryKey)}
              className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 active:scale-95 text-center cursor-pointer shadow-lg overflow-hidden ${
                cat.borderGlow
              } ${
                status.tone === 'success' && status.label.includes('OK')
                  ? 'bg-slate-900/90 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-850'
              }`}
            >
              {/* Top Colorful Icon Container */}
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-linear-to-br ${cat.gradient} text-white shadow-md group-hover:scale-105 transition-transform mb-2`}
              >
                <Icon className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              {/* Title & Subtitle */}
              <div className="w-full min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
                  {cat.title}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                  {cat.subtitle}
                </span>
              </div>

              {/* Status Pill Badge */}
              <div className="mt-2.5 w-full flex items-center justify-center">
                {status.tone === 'success' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{status.label}</span>
                  </span>
                ) : status.tone === 'warning' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{status.label}</span>
                  </span>
                ) : status.tone === 'danger' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <XCircle className="w-3 h-3" />
                    <span>{status.label}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-800 text-slate-400">
                    {status.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
