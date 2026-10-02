import React from 'react';
import { ChecklistRecord } from '../types/order';
import { RealDeviceInfo } from '../hooks/useRealDeviceInfo';
import { DeviceVisualMockup } from './DeviceVisualMockup';
import { CATEGORY_CARDS } from './CategoryTestCards';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  ArrowLeft,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';
import { calculateReportStats } from '../utils/generateTestReportImage';

interface TestResultsViewProps {
  checklist: ChecklistRecord;
  deviceInfo: RealDeviceInfo;
  onBack: () => void;
  onNewTest: () => void;
  onGenerateImage: () => void;
  onShareWhatsApp: () => void;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  checklist,
  deviceInfo,
  onBack,
  onNewTest,
  onGenerateImage,
  onShareWhatsApp,
}) => {
  const stats = calculateReportStats(checklist);
  const isAllApproved = stats.failed === 0 && stats.details === 0 && stats.approved > 0;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-24">
      {/* Top Header matching reference image Screen 4 */}
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
            <h2 className="text-base font-extrabold text-white">Resultado do Teste</h2>
            <p className="text-xs text-slate-400">Diagnóstico concluído do smartphone</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onShareWhatsApp}
          className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors"
          title="Compartilhar no WhatsApp"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Big Success / Summary Card matching reference image Screen 4 */}
      <div
        className={`p-6 rounded-3xl border text-white shadow-xl ${
          isAllApproved
            ? 'bg-linear-to-b from-emerald-600 to-emerald-700 border-emerald-400/50'
            : stats.failed > 0
            ? 'bg-linear-to-b from-rose-800 to-rose-900 border-rose-600/50'
            : 'bg-linear-to-b from-amber-700 to-amber-800 border-amber-500/50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            {isAllApproved ? (
              <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
            ) : stats.failed > 0 ? (
              <XCircle className="w-8 h-8 text-white stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-white stroke-[2.5]" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {isAllApproved
                ? 'Teste concluído!'
                : stats.failed > 0
                ? 'Atenção aos defeitos!'
                : 'Teste concluído c/ detalhes!'}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-medium leading-snug">
              {isAllApproved
                ? 'Seu aparelho está funcionando normalmente em todos os testes.'
                : stats.failed > 0
                ? `${stats.failed} item(ns) reprovado(s) e ${stats.approved} aprovado(s).`
                : `${stats.details} item(ns) requer(em) atenção técnica.`}
            </p>
          </div>
        </div>
      </div>

      {/* Real Device Information Summary Card matching reference image */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 shadow-md">
        <DeviceVisualMockup deviceInfo={deviceInfo} size="sm" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-extrabold text-white truncate">
            {deviceInfo.model !== 'Não disponível' && deviceInfo.model !== 'Detectando...'
              ? deviceInfo.model
              : deviceInfo.deviceName}
          </h4>
          <p className="text-[11px] font-mono text-slate-400 truncate mb-1">
            {deviceInfo.brand !== 'Não disponível' ? deviceInfo.brand : 'Smartphone'}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-300">
            <span>🤖 {deviceInfo.osName} {deviceInfo.osVersion}</span>
            <span>💾 {deviceInfo.ramText}</span>
            <span>💽 {deviceInfo.storageText}</span>
            <span className="truncate">📱 {deviceInfo.screenText}</span>
          </div>
        </div>
      </div>

      {/* Results List by Category matching reference image Screen 4 */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
          Itens Avaliados
        </span>

        {CATEGORY_CARDS.map((cat) => {
          const Icon = cat.icon;

          // Determine category overall status
          let isOk = true;
          let hasDetail = false;
          let hasFail = false;
          let tested = false;

          if (cat.id === 'battery') {
            tested = true;
            isOk = true;
          } else {
            cat.keys.forEach((key) => {
              const state = checklist[key];
              if (state && state.status) {
                tested = true;
                if (
                  state.status === 'nao' ||
                  state.status === 'nao_funciona' ||
                  state.status === 'nao_area'
                ) {
                  hasFail = true;
                  isOk = false;
                } else if (
                  state.status === 'com_detalhes' ||
                  state.status === 'com_dificuldade' ||
                  state.status === 'mau_toque'
                ) {
                  hasDetail = true;
                  isOk = false;
                }
              }
            });
          }

          return (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center bg-linear-to-br ${cat.gradient} text-white shadow-xs shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{cat.title}</h5>
                  <p className="text-[11px] text-slate-400">{cat.subtitle}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {hasFail ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Falha</span>
                  </span>
                ) : hasDetail ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Detalhe</span>
                  </span>
                ) : tested || isOk ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <span>OK</span>
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-slate-950" />
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                    Não avaliado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Actions matching reference image Screen 4 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30">
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onGenerateImage}
            className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Gerar relatório</span>
          </button>

          <button
            type="button"
            onClick={onNewTest}
            className="py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-950/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Novo teste</span>
          </button>
        </div>
      </div>
    </div>
  );
};
