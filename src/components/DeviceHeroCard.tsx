import React from 'react';
import { RealDeviceInfo } from '../hooks/useRealDeviceInfo';
import { DeviceVisualMockup } from './DeviceVisualMockup';
import { Battery, HardDrive, Smartphone, Cpu, Layers } from 'lucide-react';

interface DeviceHeroCardProps {
  deviceInfo: RealDeviceInfo;
  onOpenDetails?: () => void;
}

export const DeviceHeroCard: React.FC<DeviceHeroCardProps> = ({ deviceInfo, onOpenDetails }) => {
  const isBatteryAvailable = deviceInfo.batteryPercent !== null;
  const isStorageAvailable = deviceInfo.storageUsagePercent !== null;

  return (
    <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
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

          {/* Badges List with Icons matching reference */}
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
              <span>{deviceInfo.ramText}</span>
            </div>

            {/* Storage Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400">💽</span>
              <span>{deviceInfo.storageText}</span>
            </div>

            {/* Screen Badge */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-cyan-400">📱</span>
              <span className="truncate">{deviceInfo.screenText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar: Battery & Storage Cards matching reference image */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-800/80">
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

        {/* Storage Widget */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Armazenamento</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg sm:text-xl font-extrabold text-white">
              {isStorageAvailable ? `${deviceInfo.storageUsagePercent}%` : 'Não disp.'}
            </span>
            <span className="text-[9px] font-medium text-slate-400 truncate max-w-[65px]">
              {deviceInfo.storageAvailableText !== 'Não disponível'
                ? deviceInfo.storageAvailableText
                : deviceInfo.storageText}
            </span>
          </div>

          {/* Storage Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${deviceInfo.storageUsagePercent || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
