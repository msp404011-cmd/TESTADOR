import React from 'react';
import { RealDeviceInfo } from '../hooks/useRealDeviceInfo';
import { DeviceVisualMockup } from './DeviceVisualMockup';
import { Battery, HardDrive, Smartphone, Cpu, Layers, CreditCard, CheckCircle2 } from 'lucide-react';

interface DeviceHeroCardProps {
  deviceInfo: RealDeviceInfo;
  onOpenDetails?: () => void;
}

export const DeviceHeroCard: React.FC<DeviceHeroCardProps> = ({ deviceInfo, onOpenDetails }) => {
  const isBatteryAvailable = deviceInfo.batteryPercent !== null;
  const isStorageAvailable = deviceInfo.storageUsagePercent !== null;

  return (
    <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Top Device Header: Mockup + Specs */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Realistic Phone Visual */}
        <DeviceVisualMockup deviceInfo={deviceInfo} size="md" />

        {/* Device Information Badges */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Brand & Model */}
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white truncate tracking-tight">
              {deviceInfo.model !== 'Não disponível' && deviceInfo.model !== 'Detectando...'
                ? deviceInfo.model
                : deviceInfo.deviceName}
            </h2>
            <p className="text-xs font-mono text-slate-400 truncate">
              {deviceInfo.brand !== 'Não disponível' ? deviceInfo.brand : 'Aparelho Detectado'}
              {deviceInfo.formFactor === 'mobile' ? ' • Smartphone' : ' • Dispositivo'}
            </p>
          </div>

          {/* Badges List with Icons */}
          <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-slate-300 font-medium">
            {/* OS Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-400">🤖</span>
              <span>
                {deviceInfo.osName} {deviceInfo.osVersion ? deviceInfo.osVersion : ''}
              </span>
            </div>

            {/* RAM Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-blue-400">💾</span>
              <span><strong>RAM:</strong> {deviceInfo.ramText}</span>
            </div>

            {/* ROM (Memória Interna) Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400">💽</span>
              <span className="truncate">
                <strong>ROM (Interna):</strong>{' '}
                {deviceInfo.isRomPermissionBlocked ? (
                  <span className="text-amber-200/80 text-[11px] font-semibold">
                    O navegador/sistema não permite ler a memória real
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold">{deviceInfo.storageText}</span>
                )}
              </span>
            </div>

            {/* Cartão SD Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-cyan-400">💳</span>
              <span>
                <strong>Cartão SD:</strong>{' '}
                <span className={deviceInfo.sdCardInserted ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  {deviceInfo.sdCardText}
                </span>
              </span>
            </div>

            {/* Screen Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-cyan-400">📱</span>
              <span className="truncate">{deviceInfo.screenText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar: Battery & ROM (Internal Storage) */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
        {/* Battery Widget */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400">Bateria</span>
            <div className="flex items-center gap-1.5">
              {deviceInfo.hasVoltageSensor && (
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  {deviceInfo.batteryVoltage}
                </span>
              )}
              <Battery
                className={`w-4 h-4 ${
                  deviceInfo.batteryCharging
                    ? 'text-amber-400 animate-pulse'
                    : (deviceInfo.batteryPercent || 100) > 20
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              />
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-white">
              {isBatteryAvailable ? `${deviceInfo.batteryPercent}%` : 'Não disp.'}
            </span>
            {deviceInfo.batteryCharging ? (
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                ⚡ Carregando
              </span>
            ) : isBatteryAvailable ? (
              <span className="text-[9px] font-medium text-emerald-400">Em Bateria</span>
            ) : null}
          </div>

          {/* Battery Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (deviceInfo.batteryPercent || 0) > 20 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${deviceInfo.batteryPercent || 0}%` }}
            />
          </div>

          {/* Health & Sensor Line */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">Saúde:</span>
            <span
              className="font-bold truncate max-w-[120px] text-right"
              title={deviceInfo.batteryHealth}
            >
              {deviceInfo.hasHealthSensor ? (
                <span className="text-emerald-400">{deviceInfo.batteryHealth}</span>
              ) : (
                <span className="text-slate-500">Sensor não exposto</span>
              )}
            </span>
          </div>
        </div>

        {/* ROM / Memória Interna Widget */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between min-h-[105px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400">
              {deviceInfo.formFactor === 'desktop' ? 'Armazenamento Total' : 'Memória ROM (Capacidade Real)'}
            </span>
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
          </div>

          {deviceInfo.isRomPermissionBlocked ? (
            <div className="my-1 space-y-1">
              <p className="text-xs text-amber-200 font-medium leading-snug">
                O navegador / sistema não permite mostrar o tamanho real do celular.
              </p>
              <span className="inline-block text-[9px] font-bold text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                🔒 Leitura Bloqueada pelo Navegador
              </span>
            </div>
          ) : (
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-amber-300 truncate">
                {deviceInfo.storageText}
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 shrink-0 ml-1">
                Tamanho Real
              </span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Identificação:</span>
            {deviceInfo.isRomPermissionBlocked ? (
              <span className="font-bold text-amber-400">Bloqueado pelo Navegador</span>
            ) : (
              <span className="font-bold text-emerald-400">✓ Tamanho Real</span>
            )}
          </div>
        </div>
      </div>

      {/* DEDICATED SPACE: Cartão de Memória MicroSD (Marca + Tamanho) */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        deviceInfo.sdCardInserted
          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
          : 'bg-slate-950/60 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              deviceInfo.sdCardInserted ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {deviceInfo.sdCardInserted
                  ? `Cartão MicroSD: ${deviceInfo.sdCardBrand} (${deviceInfo.sdCardCapacity})`
                  : 'Cartão MicroSD (Memória Externa)'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {deviceInfo.sdCardInserted
                  ? deviceInfo.sdCardDetails
                  : 'Nenhum cartão inserido ou teste pendente'}
              </span>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            deviceInfo.sdCardInserted
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-slate-900 text-slate-400 border-slate-700'
          }`}>
            {deviceInfo.sdCardInserted ? '✓ Identificado' : 'Sem Cartão'}
          </span>
        </div>
      </div>
    </div>
  );
};
