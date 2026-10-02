import React from 'react';
import { RealDeviceInfo } from '../hooks/useRealDeviceInfo';

interface DeviceVisualMockupProps {
  deviceInfo: RealDeviceInfo;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DeviceVisualMockup: React.FC<DeviceVisualMockupProps> = ({
  deviceInfo,
  className = '',
  size = 'md',
}) => {
  const isApple = deviceInfo.brand === 'Apple' || deviceInfo.osName === 'iOS';

  // Dimension scaling
  const dimensions = {
    sm: 'w-16 h-28',
    md: 'w-24 h-40',
    lg: 'w-32 h-56',
  }[size];

  return (
    <div
      className={`relative rounded-[22px] p-[2.5px] bg-linear-to-b from-slate-400 via-slate-700 to-slate-800 shadow-2xl shrink-0 overflow-hidden ring-1 ring-white/10 ${dimensions} ${className}`}
    >
      {/* Inner Bezel */}
      <div className="relative w-full h-full rounded-[19px] bg-slate-950 p-[3px] flex flex-col items-center justify-between overflow-hidden">
        {/* Screen with colorful abstract wallpaper matching reference image */}
        <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-linear-to-br from-indigo-900 via-rose-900 to-amber-500 flex flex-col items-center justify-between p-1.5 shadow-inner">
          {/* Wallpaper dynamic blur circles */}
          <div className="absolute top-1 left-2 w-16 h-16 rounded-full bg-cyan-400/40 blur-md pointer-events-none" />
          <div className="absolute bottom-2 right-1 w-20 h-20 rounded-full bg-rose-500/40 blur-lg pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-indigo-500/30 blur-md pointer-events-none" />

          {/* Top Notch / Camera cutout */}
          <div className="relative z-10 w-full flex items-center justify-center pt-0.5">
            {isApple ? (
              // Dynamic Island
              <div className="w-6 h-2 rounded-full bg-black ring-1 ring-white/10 flex items-center justify-end px-1">
                <div className="w-1 h-1 rounded-full bg-cyan-400/80" />
              </div>
            ) : (
              // Android Camera Punch-Hole
              <div className="w-2.5 h-2.5 rounded-full bg-black ring-1 ring-white/20 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-cyan-400/60" />
              </div>
            )}
          </div>

          {/* Center Screen Content (Clock or Mini Wave) */}
          <div className="relative z-10 text-center">
            <span className="font-mono text-[9px] font-bold text-white/90 drop-shadow-sm tracking-tighter">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Bottom Home indicator */}
          <div className="relative z-10 w-8 h-0.5 rounded-full bg-white/70 shadow-xs mb-0.5" />
        </div>
      </div>
    </div>
  );
};
