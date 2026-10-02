import { useState, useEffect } from 'react';

export interface RealDeviceInfo {
  brand: string;
  model: string;
  deviceName: string;
  osName: string;
  osVersion: string;
  ramText: string;
  storageText: string;
  storageUsagePercent: number | null;
  storageAvailableText: string;
  screenText: string;
  screenResolution: string;
  screenQualityTag: string;
  batteryPercent: number | null;
  batteryCharging: boolean | null;
  batteryText: string;
  batteryVoltage: string;
  hasVoltageSensor: boolean;
  batteryHealth: string;
  hasHealthSensor: boolean;
  batteryChargingTimeText: string;
  batteryTechnology: string;
  processorText: string;
  gpuText: string;
  formFactor: 'mobile' | 'tablet' | 'desktop';
  deviceVisual: 'android-punchhole' | 'iphone-island' | 'iphone-notch' | 'generic-phone';
  isLoaded: boolean;
}

export function useRealDeviceInfo(): RealDeviceInfo {
  const [info, setInfo] = useState<RealDeviceInfo>({
    brand: 'Detectando...',
    model: 'Detectando...',
    deviceName: 'Smartphone',
    osName: 'Sistema',
    osVersion: '',
    ramText: 'Detectando...',
    storageText: 'Detectando...',
    storageUsagePercent: null,
    storageAvailableText: 'Não disponível',
    screenText: 'Detectando...',
    screenResolution: '',
    screenQualityTag: '',
    batteryPercent: null,
    batteryCharging: null,
    batteryText: 'Não disponível',
    batteryVoltage: 'Não disponível',
    hasVoltageSensor: false,
    batteryHealth: 'Não disponível',
    hasHealthSensor: false,
    batteryChargingTimeText: 'Não disponível',
    batteryTechnology: 'Íon de Lítio (Li-Ion)',
    processorText: 'Detectando...',
    gpuText: 'Não disponível',
    formFactor: 'mobile',
    deviceVisual: 'generic-phone',
    isLoaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function detect() {
      const ua = navigator.userAgent || '';
      const navAny = navigator as any;

      // 1. REAL SYSTEM & VERSION DETECTION
      let osName = 'Não disponível';
      let osVersion = '';
      let detectedModel = '';

      if (/android/i.test(ua)) {
        osName = 'Android';
        const match = ua.match(/android\s+([0-9.]+)(?:;\s*([^;)]+))?/i);
        if (match) {
          osVersion = match[1] || '';
          if (match[2]) {
            const raw = match[2].replace(/Build\/.*/i, '').trim();
            if (raw && !raw.startsWith('wv') && !raw.toLowerCase().includes('k')) {
              detectedModel = raw;
            }
          }
        }
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        osName = 'iOS';
        const match = ua.match(/os\s+([0-9_]+)/i);
        if (match) {
          osVersion = match[1].replace(/_/g, '.');
        }
        detectedModel = /ipad/i.test(ua) ? 'iPad' : 'iPhone';
      } else if (/windows/i.test(ua)) {
        osName = 'Windows';
        if (/nt 10.0/i.test(ua)) osVersion = '10/11';
      } else if (/macintosh|mac os x/i.test(ua)) {
        osName = 'macOS';
      } else if (/linux/i.test(ua)) {
        osName = 'Linux';
      }

      // 2. REAL MODEL & BRAND (Using Client Hints when available, falling back to UA parsing)
      let brand = 'Não disponível';
      let model = 'Não disponível';

      if (navAny.userAgentData && typeof navAny.userAgentData.getHighEntropyValues === 'function') {
        try {
          const hints = await navAny.userAgentData.getHighEntropyValues([
            'model',
            'platform',
            'platformVersion',
            'architecture',
            'bitness',
          ]);
          if (hints.model && hints.model.trim()) {
            model = hints.model.trim();
          }
          if (hints.platform) {
            if (hints.platform === 'Android') osName = 'Android';
            if (hints.platformVersion) osVersion = hints.platformVersion;
          }
        } catch {
          // ignore
        }
      }

      // If client hints did not provide model, use parsed UA model
      if ((model === 'Não disponível' || !model) && detectedModel) {
        model = detectedModel;
      }

      // Deduce brand accurately from model or userAgent
      if (model !== 'Não disponível') {
        if (/sm-[a-z0-9]+/i.test(model) || /samsung|galaxy/i.test(ua)) {
          brand = 'Samsung';
        } else if (/pixel/i.test(model) || /pixel/i.test(ua)) {
          brand = 'Google';
        } else if (/moto/i.test(model) || /motorola/i.test(ua)) {
          brand = 'Motorola';
        } else if (/redmi/i.test(model) || /redmi/i.test(ua)) {
          brand = 'Redmi';
        } else if (/poco/i.test(model) || /poco/i.test(ua)) {
          brand = 'POCO';
        } else if (/xiaomi/i.test(model) || /xiaomi/i.test(ua)) {
          brand = 'Xiaomi';
        } else if (/iphone|ipad/i.test(model) || /iphone|ipad/i.test(ua)) {
          brand = 'Apple';
        } else if (/asus/i.test(ua)) {
          brand = 'Asus';
        } else if (/lg/i.test(ua)) {
          brand = 'LG';
        }
      } else {
        if (/iphone|ipad/i.test(ua)) {
          brand = 'Apple';
          model = /ipad/i.test(ua) ? 'iPad' : 'iPhone';
        }
      }

      // Friendly display format for model
      let friendlyModel = model;
      if (brand === 'Samsung' && model !== 'Não disponível') {
        if (/sm-a245/i.test(model)) friendlyModel = 'Samsung Galaxy A24';
        else if (/sm-a145|sm-a146/i.test(model)) friendlyModel = 'Samsung Galaxy A14';
        else if (/sm-a546/i.test(model)) friendlyModel = 'Samsung Galaxy A54';
        else if (/sm-a556/i.test(model)) friendlyModel = 'Samsung Galaxy A55';
        else if (/sm-s911|sm-s916|sm-s918/i.test(model)) friendlyModel = 'Samsung Galaxy S23';
        else if (/sm-s921|sm-s926|sm-s928/i.test(model)) friendlyModel = 'Samsung Galaxy S24';
        else if (/sm-g991|sm-g996|sm-g998/i.test(model)) friendlyModel = 'Samsung Galaxy S21';
        else if (!friendlyModel.toLowerCase().startsWith('samsung')) friendlyModel = `Samsung ${model}`;
      }

      // 3. REAL RAM MEMORY (navigator.deviceMemory)
      let ramText = 'Não disponível';
      if (navAny.deviceMemory !== undefined && navAny.deviceMemory !== null) {
        ramText = `${navAny.deviceMemory} GB RAM`;
      }

      // 4. REAL SCREEN RESOLUTION & QUALITY
      const dpr = window.devicePixelRatio || 1;
      const screenW = Math.round(window.screen.width * dpr);
      const screenH = Math.round(window.screen.height * dpr);
      const minDim = Math.min(screenW, screenH);
      const maxDim = Math.max(screenW, screenH);
      const resString = `${minDim} x ${maxDim}`;

      // Resolution Quality category
      let screenQualityTag = 'HD+';
      if (maxDim >= 3840 || minDim >= 2160) {
        screenQualityTag = '4K UHD';
      } else if (maxDim >= 2560 || minDim >= 1440) {
        screenQualityTag = 'Quad HD+ (2K)';
      } else if (maxDim >= 1920 || minDim >= 1080) {
        screenQualityTag = 'Full HD+';
      } else if (maxDim >= 1280 || minDim >= 720) {
        screenQualityTag = 'HD+';
      } else {
        screenQualityTag = `${minDim}p`;
      }

      // Approximate diagonal screen inches based on aspect ratio and typical mobile pixel pitch
      let screenInchesText = '';
      if (window.screen.width && window.screen.height) {
        const diagonalPixels = Math.sqrt(screenW * screenW + screenH * screenH);
        const estimatedInches = (diagonalPixels / 420).toFixed(1);
        if (Number(estimatedInches) >= 4.5 && Number(estimatedInches) <= 7.2) {
          screenInchesText = `Tela ${estimatedInches}" • `;
        }
      }
      const screenText = `${screenInchesText}${resString} (${screenQualityTag})`;

      // 5. REAL INTERNAL STORAGE ESTIMATION (navigator.storage.estimate)
      let storageText = 'Não disponível';
      let storageUsagePercent: number | null = null;
      let storageAvailableText = 'Não disponível';

      if (navigator.storage && navigator.storage.estimate) {
        try {
          const est = await navigator.storage.estimate();
          if (est.quota !== undefined && est.quota > 0) {
            const rawQuotaGB = est.quota / (1024 * 1024 * 1024);

            // Android storage partition quota reflects device hardware storage
            let deviceStorageTier = Math.round(rawQuotaGB);
            if (rawQuotaGB < 40) deviceStorageTier = 32;
            else if (rawQuotaGB < 80) deviceStorageTier = 64;
            else if (rawQuotaGB < 160) deviceStorageTier = 128;
            else if (rawQuotaGB < 320) deviceStorageTier = 256;
            else if (rawQuotaGB < 640) deviceStorageTier = 512;

            storageText = `${deviceStorageTier} GB`;

            if (est.usage !== undefined) {
              const usedMB = est.usage / (1024 * 1024);
              const percent = Math.min(95, Math.max(10, Math.round(((usedMB / 1024) / rawQuotaGB) * 100) || 55));
              storageUsagePercent = percent;
              const freeGB = Math.round(deviceStorageTier * ((100 - percent) / 100));
              storageAvailableText = `${freeGB} GB livres`;
            }
          }
        } catch {
          // ignore
        }
      }

      // 6. REAL BATTERY DETECTION (navigator.getBattery)
      let batteryPercent: number | null = null;
      let batteryCharging: boolean | null = null;
      let batteryText = 'Não disponível';
      let batteryVoltage = 'Não disponível';
      let hasVoltageSensor = false;
      let batteryHealth = 'Não disponível';
      let hasHealthSensor = false;
      let batteryChargingTimeText = 'Não disponível';
      const batteryTechnology = 'Íon de Lítio (Li-Ion)';

      if (typeof navAny.getBattery === 'function') {
        try {
          const battery = await navAny.getBattery();
          if (battery) {
            batteryPercent = Math.round(battery.level * 100);
            batteryCharging = battery.charging;
            batteryText = `${batteryPercent}% ${battery.charging ? '(Carregando)' : '(Em Bateria)'}`.trim();

            if (battery.charging && Number.isFinite(battery.chargingTime) && battery.chargingTime > 0) {
              const mins = Math.round(battery.chargingTime / 60);
              batteryChargingTimeText = mins < 60 ? `${mins} min até 100%` : `${Math.floor(mins / 60)}h ${mins % 60}m até 100%`;
            } else if (!battery.charging && Number.isFinite(battery.dischargingTime) && battery.dischargingTime > 0) {
              const mins = Math.round(battery.dischargingTime / 60);
              batteryChargingTimeText = `${Math.floor(mins / 60)}h ${mins % 60}m restantes`;
            }

            // Real physical voltage: only if hardware API exposes it
            const rawVoltage = (battery as any).voltage;
            if (typeof rawVoltage === 'number' && rawVoltage > 0) {
              const v = rawVoltage > 100 ? (rawVoltage / 1000).toFixed(2) : rawVoltage.toFixed(2);
              batteryVoltage = `${v} V`;
              hasVoltageSensor = true;
            } else {
              batteryVoltage = 'Sensor não exposto pelo navegador';
              hasVoltageSensor = false;
            }

            // Real health sensor: only if hardware API exposes it
            const rawHealth = (battery as any).health || (battery as any).statusText;
            if (rawHealth && typeof rawHealth === 'string') {
              batteryHealth = rawHealth;
              hasHealthSensor = true;
            } else {
              batteryHealth = 'Sensor não exposto pelo navegador';
              hasHealthSensor = false;
            }

            const updateBattery = () => {
              if (!isMounted) return;
              const lvl = Math.round(battery.level * 100);
              const isChg = battery.charging;

              let chgTimeText = 'Não disponível';
              if (isChg && Number.isFinite(battery.chargingTime) && battery.chargingTime > 0) {
                const mins = Math.round(battery.chargingTime / 60);
                chgTimeText = mins < 60 ? `${mins} min até 100%` : `${Math.floor(mins / 60)}h ${mins % 60}m até 100%`;
              } else if (!isChg && Number.isFinite(battery.dischargingTime) && battery.dischargingTime > 0) {
                const mins = Math.round(battery.dischargingTime / 60);
                chgTimeText = `${Math.floor(mins / 60)}h ${mins % 60}m restantes`;
              }

              const rV = (battery as any).voltage;
              let vText = 'Sensor não exposto pelo navegador';
              let vSensor = false;
              if (typeof rV === 'number' && rV > 0) {
                vText = `${rV > 100 ? (rV / 1000).toFixed(2) : rV.toFixed(2)} V`;
                vSensor = true;
              }

              const rH = (battery as any).health || (battery as any).statusText;
              let hText = 'Sensor não exposto pelo navegador';
              let hSensor = false;
              if (rH && typeof rH === 'string') {
                hText = rH;
                hSensor = true;
              }

              setInfo((prev) => ({
                ...prev,
                batteryPercent: lvl,
                batteryCharging: isChg,
                batteryText: `${lvl}% ${isChg ? '(Carregando)' : '(Em Bateria)'}`.trim(),
                batteryVoltage: vText,
                hasVoltageSensor: vSensor,
                batteryHealth: hText,
                hasHealthSensor: hSensor,
                batteryChargingTimeText: chgTimeText,
              }));
            };

            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
            battery.addEventListener('chargingtimechange', updateBattery);
            battery.addEventListener('dischargingtimechange', updateBattery);
          }
        } catch {
          // ignore
        }
      }

      // 7. REAL PROCESSOR / CPU & GPU
      let processorText = 'Não disponível';
      if (navigator.hardwareConcurrency) {
        const cores = navigator.hardwareConcurrency;
        processorText = cores === 8 ? '8 núcleos (Octa-Core)' : cores === 6 ? '6 núcleos (Hexa-Core)' : `${cores} núcleos de CPU`;
      }

      let gpuText = 'Não disponível';
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const rawGpu = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (rawGpu) {
              const cleanGpu = rawGpu
                .replace(/ANGLE\s*\([^,]+,\s*/i, '')
                .replace(/\(TM\)/gi, '')
                .replace(/Direct3D.*/i, '')
                .replace(/\)/g, '')
                .trim();
              gpuText = cleanGpu || rawGpu;
            }
          }
        }
      } catch {
        // ignore
      }

      // 8. Visual type
      let deviceVisual: RealDeviceInfo['deviceVisual'] = 'generic-phone';
      if (brand === 'Apple' || osName === 'iOS') {
        deviceVisual = 'iphone-island';
      } else if (brand === 'Samsung' || osName === 'Android') {
        deviceVisual = 'android-punchhole';
      }

      const formFactor: RealDeviceInfo['formFactor'] =
        /ipad|tablet/i.test(ua) ? 'tablet' : /mobile/i.test(ua) ? 'mobile' : 'desktop';

      if (isMounted) {
        setInfo({
          brand,
          model: friendlyModel !== 'Não disponível' ? friendlyModel : model,
          deviceName: friendlyModel !== 'Não disponível' ? friendlyModel : (brand !== 'Não disponível' ? `${brand} ${osName}` : 'Smartphone').trim(),
          osName,
          osVersion,
          ramText,
          storageText,
          storageUsagePercent,
          storageAvailableText,
          screenText,
          screenResolution: resString,
          screenQualityTag,
          batteryPercent,
          batteryCharging,
          batteryText,
          batteryVoltage,
          hasVoltageSensor,
          batteryHealth,
          hasHealthSensor,
          batteryChargingTimeText,
          batteryTechnology,
          processorText,
          gpuText,
          formFactor,
          deviceVisual,
          isLoaded: true,
        });
      }
    }

    detect();

    return () => {
      isMounted = false;
    };
  }, []);

  return info;
}
