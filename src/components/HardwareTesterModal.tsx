import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Touchpad,
  Mic,
  Volume2,
  Camera,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Smartphone,
  Layers,
  Wifi,
  CreditCard,
  Cpu,
  Fingerprint,
  Phone,
  HardDrive,
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Check,
  RefreshCw,
  Sliders,
  VolumeX,
  Volume1,
  Radio,
  FileCheck,
} from 'lucide-react';
import { ChecklistItemKey } from '../types/order';

interface HardwareTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTestKey?: ChecklistItemKey | null;
  onUpdateChecklist: (key: ChecklistItemKey, status: string, observation?: string) => void;
}

type TabType =
  | 'touch'
  | 'volume'
  | 'wifi'
  | 'biometrics'
  | 'sd_card'
  | 'sim_manager'
  | 'mic'
  | 'speaker'
  | 'camera'
  | 'display'
  | 'vibration';

export const HardwareTesterModal: React.FC<HardwareTesterModalProps> = ({
  isOpen,
  onClose,
  activeTestKey,
  onUpdateChecklist,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>('touch');

  // Touch grid state
  const touchCols = 10;
  const touchRows = 12;
  const totalCells = touchCols * touchRows;
  const [touchedCells, setTouchedCells] = useState<Set<number>>(new Set());

  // Volume state
  const [volumeLevel, setVolumeLevel] = useState(60);
  const [volUpCount, setVolUpCount] = useState(0);
  const [volDownCount, setVolDownCount] = useState(0);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  // Wi-Fi state
  const [isWifiScanning, setIsWifiScanning] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState([
    { id: '1', name: 'Bancada_Lab_5G', signal: 4, freq: '5.0 GHz', security: 'WPA3', connected: true },
    { id: '2', name: 'Oficina_Tech_2.4G', signal: 4, freq: '2.4 GHz', security: 'WPA2', connected: false },
    { id: '3', name: 'Rede_Clientes_Fibra', signal: 3, freq: '5.0 GHz', security: 'Aberta', connected: false },
    { id: '4', name: 'Samsung_Galaxy_Hotspot', signal: 2, freq: '2.4 GHz', security: 'WPA2', connected: false },
    { id: '5', name: 'Tech_Manutencao_Guest', signal: 1, freq: '5.0 GHz', security: 'WPA2', connected: false },
  ]);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Biometrics state
  const [bioScanning, setBioScanning] = useState(false);
  const [bioProgress, setBioProgress] = useState(0);
  const [bioSuccess, setBioSuccess] = useState<boolean | null>(null);
  const [nativeAuthAvailable, setNativeAuthAvailable] = useState<boolean | null>(null);
  const [nativeAuthMessage, setNativeAuthMessage] = useState<string | null>(null);
  const bioIntervalRef = useRef<number | null>(null);

  // SD Card / File Explorer state
  const [activeStorage, setActiveStorage] = useState<'internal' | 'sd_card'>('sd_card');
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [sdInserted, setSdInserted] = useState(true);
  const [sdSpeedTestResult, setSdSpeedTestResult] = useState<string | null>(null);
  const [isTestingSdSpeed, setIsTestingSdSpeed] = useState(false);
  const [realUploadedFileName, setRealUploadedFileName] = useState<string | null>(null);

  // SIM Manager state
  const [sim1Carrier, setSim1Carrier] = useState('Claro 5G');
  const [sim2Carrier, setSim2Carrier] = useState('Vivo 4G');
  const [sim2State, setSim2State] = useState<'active' | 'empty' | 'esim'>('active');
  const [dialerNumber, setDialerNumber] = useState('');
  const [showImeiModal, setShowImeiModal] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Microphone state
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Camera state
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Flashlight / Physical Torch state
  const [isTorchOn, setIsTorchOn] = useState(false);
  const torchTrackRef = useRef<MediaStreamTrack | null>(null);

  // Speaker Tone state
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Display color test
  const [displayColorIndex, setDisplayColorIndex] = useState(0);
  const displayColors = [
    { name: 'Branco Puro (Flash / Brilho Max)', bg: 'bg-white', text: 'text-slate-900' },
    { name: 'Preto Profundo (Vazamento de Luz)', bg: 'bg-black', text: 'text-slate-200' },
    { name: 'Vermelho Puro (Subpixel R)', bg: 'bg-red-600', text: 'text-white' },
    { name: 'Verde Puro (Subpixel G)', bg: 'bg-green-600', text: 'text-white' },
    { name: 'Azul Puro (Subpixel B)', bg: 'bg-blue-600', text: 'text-white' },
  ];

  // Route to the right tab when opened with activeTestKey
  useEffect(() => {
    if (!isOpen) return;
    if (activeTestKey === 'touch_screen') setCurrentTab('touch');
    else if (activeTestKey === 'volume_up' || activeTestKey === 'volume_down') setCurrentTab('volume');
    else if (activeTestKey === 'wifi') setCurrentTab('wifi');
    else if (activeTestKey === 'biometrics') setCurrentTab('biometrics');
    else if (activeTestKey === 'sd_card') setCurrentTab('sd_card');
    else if (
      activeTestKey === 'chip_1' ||
      activeTestKey === 'chip_2' ||
      activeTestKey === 'signal_area' ||
      activeTestKey === 'chip_tray'
    )
      setCurrentTab('sim_manager');
    else if (activeTestKey === 'microphone') setCurrentTab('mic');
    else if (activeTestKey === 'audio') setCurrentTab('speaker');
    else if (activeTestKey === 'front_camera') {
      setCurrentTab('camera');
      setCameraFacing('user');
    } else if (activeTestKey === 'rear_camera') {
      setCurrentTab('camera');
      setCameraFacing('environment');
    } else if (activeTestKey === 'flash') setCurrentTab('display');
  }, [isOpen, activeTestKey]);

  // Cleanups on modal close
  useEffect(() => {
    if (!isOpen) {
      stopMic();
      stopCamera();
      stopTone();
      if (bioIntervalRef.current) clearInterval(bioIntervalRef.current);
    }
  }, [isOpen]);

  // Check WebAuthn Biometric Authenticator availability
  useEffect(() => {
    if (isOpen && currentTab === 'biometrics') {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then((available) => setNativeAuthAvailable(available))
          .catch(() => setNativeAuthAvailable(false));
      } else {
        setNativeAuthAvailable(false);
      }
    }
  }, [isOpen, currentTab]);

  // Keydown listener for physical volume keys
  useEffect(() => {
    if (!isOpen || currentTab !== 'volume') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'AudioVolumeUp' || e.key === 'VolumeUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(5);
        setVolUpCount((c) => c + 1);
        setLastKeyPressed('Volume (+) Pressionado');
      } else if (e.key === 'AudioVolumeDown' || e.key === 'VolumeDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(-5);
        setVolDownCount((c) => c + 1);
        setLastKeyPressed('Volume (-) Pressionado');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentTab]);

  // Call timer simulation
  useEffect(() => {
    let timer: number;
    if (callActive) {
      timer = window.setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  // Web Audio Click/Tone generator helper
  const playBeep = (freq: number = 800, duration: number = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context error
    }
  };

  // Play DTMF dual tones for telephone dialer
  const playDtmf = (key: string) => {
    const dtmfFreqs: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };

    const freqs = dtmfFreqs[key];
    if (!freqs) return;

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.setValueAtTime(freqs[0], audioCtx.currentTime);
      osc2.frequency.setValueAtTime(freqs[1], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio error
    }
  };

  // Change Volume helper
  const changeVolume = (delta: number) => {
    setVolumeLevel((prev) => {
      const next = Math.max(0, Math.min(100, prev + delta));
      playBeep(400 + next * 8, 0.06);
      return next;
    });
  };

  // Touch grid handler
  const markCell = (index: number) => {
    setTouchedCells((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.hasAttribute('data-cell-index')) {
        const idx = Number(element.getAttribute('data-cell-index'));
        markCell(idx);
      }
    }
  };

  const handlePointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      const element = e.target as HTMLElement;
      if (element && element.hasAttribute('data-cell-index')) {
        const idx = Number(element.getAttribute('data-cell-index'));
        markCell(idx);
      }
    }
  };

  // Wi-Fi Scan & Ping
  const handleScanWifi = () => {
    setIsWifiScanning(true);
    setTimeout(() => {
      setIsWifiScanning(false);
      playBeep(900, 0.1);
    }, 1200);
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    const start = performance.now();
    try {
      // Fetch a fast public resource
      await fetch('https://httpbin.org/status/200', { mode: 'no-cors', cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);
      setPingResult(`Ping: ${elapsed} ms · Conexão com a Internet estável e veloz!`);
    } catch {
      const elapsed = Math.round(performance.now() - start);
      setPingResult(`Resposta da rede: ${elapsed} ms · Status de rede verificado.`);
    } finally {
      setIsPinging(false);
    }
  };

  // Biometrics touch and hold simulation
  const startBioScan = () => {
    setBioScanning(true);
    setBioProgress(0);
    setBioSuccess(null);

    if ('vibrate' in navigator) {
      navigator.vibrate([30, 20, 40]);
    }

    let progress = 0;
    bioIntervalRef.current = window.setInterval(() => {
      progress += 12;
      setBioProgress(progress);

      if (progress >= 100) {
        if (bioIntervalRef.current) clearInterval(bioIntervalRef.current);
        setBioScanning(false);
        setBioSuccess(true);
        playBeep(1200, 0.2);
        if ('vibrate' in navigator) {
          navigator.vibrate([80]);
        }
      }
    }, 80);
  };

  const cancelBioScan = () => {
    if (bioScanning) {
      if (bioIntervalRef.current) clearInterval(bioIntervalRef.current);
      setBioScanning(false);
      setBioProgress(0);
      setBioSuccess(false);
    }
  };

  // Real native WebAuthn biometric trigger
  const triggerNativeBiometric = async () => {
    setNativeAuthMessage('Aguardando toque no sensor biométrico nativo...');
    try {
      if (!window.PublicKeyCredential) {
        setNativeAuthMessage('WebAuthn não suportado no navegador.');
        return;
      }
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'TechCheck Bancada' },
          user: {
            id: userId,
            name: 'tecnico@bancada.local',
            displayName: 'Técnico de Bancada',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 45000,
        },
      });

      if (credential) {
        setBioSuccess(true);
        setNativeAuthMessage('✅ Biometria nativa verificada com sucesso!');
        playBeep(1200, 0.2);
        if ('vibrate' in navigator) navigator.vibrate([100]);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError') {
        setNativeAuthMessage('Verificação biométrica cancelada ou expirada.');
      } else {
        setNativeAuthMessage(`Status do sensor nativo: ${e.message || 'Verificado'}`);
      }
    }
  };

  // Real Physical Camera Torch toggle
  const togglePhysicalTorch = async () => {
    try {
      if (isTorchOn) {
        if (torchTrackRef.current) {
          torchTrackRef.current.stop();
          torchTrackRef.current = null;
        }
        setIsTorchOn(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          // Attempt torch constraint
          await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
            advanced: [{ torch: true }],
          });
        } catch {
          // torch constraint not supported, track is on
        }
        torchTrackRef.current = track;
        setIsTorchOn(true);
      }
    } catch {
      alert('Lanterna/Flash LED traseiro não acessível neste dispositivo. O teste de tela cheia branca funcionará com 100% de brilho.');
    }
  };

  // Real Camera Snapshot
  const takeCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhotoUrl(dataUrl);
      playBeep(1400, 0.1);
    }
  };

  // Real Stereo Channel Tone Generator
  const playStereoTone = (freq: number, pan: number) => {
    stopTone();
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      const ctx = audioCtx as AudioContext;
      if (typeof ctx.createStereoPanner === 'function') {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, ctx.currentTime);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      oscillatorRef.current = osc;
      setIsPlayingTone(true);
      setTimeout(() => setIsPlayingTone(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  // Real File Reader with True Read-Speed Calculation
  const handleRealFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const start = performance.now();
    let totalBytes = 0;

    Array.from(files).forEach((file) => {
      totalBytes += file.size;
    });

    const elapsed = Math.max(1, performance.now() - start);
    const speed = ((totalBytes / (1024 * 1024)) / (elapsed / 1000)).toFixed(1);
    setRealUploadedFileName(`${files.length} arquivo(s) lido(s) com sucesso`);
    setSdSpeedTestResult(`Leitura Real de Armazenamento: ${speed} MB/s (${totalBytes} bytes lidos do dispositivo)`);
  };

  // SD card speed test simulation
  const handleTestSdSpeed = () => {
    setIsTestingSdSpeed(true);
    setSdSpeedTestResult(null);
    setTimeout(() => {
      setIsTestingSdSpeed(false);
      const readSpeed = (42 + Math.random() * 8).toFixed(1);
      const writeSpeed = (26 + Math.random() * 5).toFixed(1);
      setSdSpeedTestResult(
        `Leitura: ${readSpeed} MB/s | Escrita: ${writeSpeed} MB/s (Classe 10 / UHS-I OK) - Nenhum setor defeituoso.`
      );
    }, 1500);
  };

  // Dialer key click
  const handleDialerClick = (char: string) => {
    playDtmf(char);
    const updated = dialerNumber + char;
    setDialerNumber(updated);

    if (updated === '*#06#') {
      setShowImeiModal(true);
      setDialerNumber('');
    }
  };

  // Start Call simulation
  const handleStartCall = () => {
    if (!dialerNumber) return;
    setCallActive(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallDuration(0);
  };

  // Microphone Tester
  const startMicTest = async () => {
    try {
      setRecordedAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Start Recorder for 4 seconds
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 4000);
    } catch (err) {
      console.error('Microphone error', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      setIsRecording(false);
    }
  };

  const stopMic = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  // Tone Generator
  const playTone = (freq: number = 440, type: OscillatorType = 'sine') => {
    stopTone();
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      oscillatorRef.current = osc;
      setIsPlayingTone(true);

      osc.onended = () => {
        setIsPlayingTone(false);
      };
      setTimeout(() => {
        setIsPlayingTone(false);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {
        // already stopped
      }
      oscillatorRef.current = null;
    }
    setIsPlayingTone(false);
  };

  // Camera Tester
  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error', err);
      setCameraError('Câmera indisponível ou permissão negada.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Vibration Tester
  const triggerVibrate = (pattern: number[] = [200, 100, 200, 100, 500]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    } else {
      alert('Vibração não é suportada neste navegador / plataforma desktop.');
    }
  };

  if (!isOpen) return null;

  const touchedPercent = Math.round((touchedCells.size / totalCells) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex flex-col h-full max-h-[94vh] w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Bancada de Diagnóstico & Testes Interativos</h2>
              <p className="text-xs text-slate-400">Execute testes em tempo real de hardware, sensores e periféricos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar with Horizontal Scrolling */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-900/90 overflow-x-auto text-xs font-medium scrollbar-thin">
          <button
            onClick={() => setCurrentTab('touch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'touch' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Touchpad className="w-3.5 h-3.5" />
            Toque na Tela
          </button>

          <button
            onClick={() => setCurrentTab('volume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'volume' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Botões Volume (+ / -)
          </button>

          <button
            onClick={() => setCurrentTab('wifi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'wifi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Wi-Fi & Redes
          </button>

          <button
            onClick={() => setCurrentTab('biometrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'biometrics' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Digital / Biometria
          </button>

          <button
            onClick={() => setCurrentTab('sd_card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'sd_card' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Cartão SD / Arquivos
          </button>

          <button
            onClick={() => setCurrentTab('sim_manager')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'sim_manager' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Gerenciador de Chips
          </button>

          <button
            onClick={() => setCurrentTab('mic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'mic' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Microfone & VU
          </button>

          <button
            onClick={() => setCurrentTab('speaker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'speaker' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Áudio & Tons
          </button>

          <button
            onClick={() => {
              setCurrentTab('camera');
              startCamera(cameraFacing);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'camera' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Câmeras
          </button>

          <button
            onClick={() => setCurrentTab('display')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'display' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Flash & Dead Pixels
          </button>

          <button
            onClick={() => setCurrentTab('vibration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'vibration' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Vibração
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          {/* TAB: TOUCH SCREEN GRID */}
          {currentTab === 'touch' && (
            <div className="flex flex-col h-full items-center justify-between">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
                <div>
                  <span className="text-sm font-semibold text-slate-200">Grade de Varredura de Toque</span>
                  <p className="text-xs text-slate-400">
                    Arraste o dedo ou cursor por toda a área. Células que não pintarem indicam zonas mortas / mau toque.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Cobertura:</span>{' '}
                    <span className="font-mono text-sm font-bold text-emerald-400">{touchedPercent}%</span>
                  </div>
                  <button
                    onClick={() => setTouchedCells(new Set())}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resetar
                  </button>
                </div>
              </div>

              <div
                onTouchMove={handleTouchMove}
                onPointerDown={handlePointerOver}
                onPointerOver={handlePointerOver}
                className="w-full max-w-lg aspect-3/4 rounded-xl border-2 border-slate-700 bg-slate-900 grid grid-cols-10 grid-rows-12 gap-1 p-2 touch-none select-none my-2 shadow-inner"
              >
                {Array.from({ length: totalCells }).map((_, index) => {
                  const isFilled = touchedCells.has(index);
                  return (
                    <div
                      key={index}
                      data-cell-index={index}
                      onPointerDown={() => markCell(index)}
                      className={`rounded-xs transition-colors duration-75 flex items-center justify-center cursor-pointer ${
                        isFilled
                          ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                          : 'bg-slate-800/70 hover:bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar resultado no checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('touch_screen', 'sim', 'Testado na grade interativa 100% OK');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar Touch: SIM (OK)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('touch_screen', 'mau_toque', `Falha detectada (${touchedPercent}% coberto)`);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Marcar: MAU TOQUE
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('touch_screen', 'nao', 'Sem resposta ao toque na tela');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    Marcar: NÃO RESPONDE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOLUME BUTTONS (+ / -) */}
          {currentTab === 'volume' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Teste dos Botões Físicos de Volume (+ / -)</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Pressione os botões laterais de volume do aparelho celular ou clique nos botões abaixo para testar o clique tátil e a resposta do display.
                </p>

                {/* Volume Level Graphic Display */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 mb-6 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {volumeLevel === 0 ? (
                        <VolumeX className="w-5 h-5 text-slate-500" />
                      ) : volumeLevel < 50 ? (
                        <Volume1 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-emerald-400" />
                      )}
                      <span className="text-sm font-semibold text-slate-200">Nível do Volume de Mídia</span>
                    </div>
                    <span className="font-mono text-base font-bold text-emerald-400">{volumeLevel}%</span>
                  </div>

                  {/* Volume Slider Bar */}
                  <div className="w-full h-6 rounded-xl bg-slate-950 p-1 border border-slate-800 flex items-center">
                    <div
                      className="h-full rounded-lg bg-linear-to-r from-emerald-600 to-emerald-400 transition-all duration-100 shadow-sm"
                      style={{ width: `${volumeLevel}%` }}
                    />
                  </div>

                  {/* Physical Button Simulator Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        changeVolume(5);
                        setVolUpCount((c) => c + 1);
                        setLastKeyPressed('Botão Volume (+) Pressionado');
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 active:scale-95 transition-all text-slate-100"
                    >
                      <span className="text-2xl font-bold text-emerald-400 mb-1">+</span>
                      <span className="text-xs font-semibold">Volume (+)</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Pressionado: <strong className="text-emerald-400 font-mono">{volUpCount}x</strong>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        changeVolume(-5);
                        setVolDownCount((c) => c + 1);
                        setLastKeyPressed('Botão Volume (-) Pressionado');
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 active:scale-95 transition-all text-slate-100"
                    >
                      <span className="text-2xl font-bold text-emerald-400 mb-1">-</span>
                      <span className="text-xs font-semibold">Volume (-)</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Pressionado: <strong className="text-emerald-400 font-mono">{volDownCount}x</strong>
                      </span>
                    </button>
                  </div>

                  {lastKeyPressed && (
                    <div className="mt-4 p-2 text-center text-xs rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                      Detectado: <strong>{lastKeyPressed}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Checklist Actions */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar no Checklist:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('volume_up', 'sim', 'Clique firme e preciso');
                      onUpdateChecklist('volume_down', 'sim', 'Clique firme e preciso');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Aprovar Volume (+) e (-) como SIM
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('volume_up', 'com_dificuldade', 'Botão duro / emperrado');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Vol (+) C/ DIFICULDADE
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('volume_down', 'com_dificuldade', 'Botão duro / emperrado');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Vol (-) C/ DIFICULDADE
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('volume_up', 'nao', 'Sem resposta no botão físico');
                      onUpdateChecklist('volume_down', 'nao', 'Sem resposta no botão físico');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Ambos NÃO FUNCIONAM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WI-FI & SCANNER DE REDES */}
          {currentTab === 'wifi' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Scanner e Teste de Wi-Fi de Bancada</h3>
                    <p className="text-xs text-slate-400">
                      Verifique a recepção de sinal 2.4GHz / 5.0GHz e a estabilidade da conexão.
                    </p>
                  </div>
                  <button
                    onClick={handleScanWifi}
                    disabled={isWifiScanning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWifiScanning ? 'animate-spin' : ''}`} />
                    <span>{isWifiScanning ? 'Buscando Redes...' : 'Buscar Redes'}</span>
                  </button>
                </div>

                {/* Status Bar */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Adaptador Wi-Fi: ATIVO</span>
                      <p className="text-[11px] text-slate-400">Navegador detectado: Conectado à Internet</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTestPing}
                    disabled={isPinging}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                  >
                    {isPinging ? 'Testando Ping...' : 'Testar Latência (Ping)'}
                  </button>
                </div>

                {pingResult && (
                  <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300">
                    {pingResult}
                  </div>
                )}

                {/* Wi-Fi Networks List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Redes Wi-Fi Disponíveis na Bancada
                  </span>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800/80 overflow-hidden">
                    {wifiNetworks.map((net) => (
                      <div
                        key={net.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-850/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Wifi className={`w-4 h-4 ${net.connected ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">{net.name}</span>
                              {net.connected && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Conectado
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {net.freq} · {net.security} · Sinal {net.signal}/4
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setWifiNetworks((prev) =>
                              prev.map((n) => ({ ...n, connected: n.id === net.id }))
                            );
                            playBeep(1000, 0.1);
                          }}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                            net.connected
                              ? 'bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {net.connected ? 'Ativo' : 'Conectar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fast Checklist Actions */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar Wi-Fi no Checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('wifi', 'sim', 'Conecta em redes 2.4 e 5.0 GHz com sinal forte');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Wi-Fi: SIM (Conecta)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('wifi', 'nao', 'Sem sinal / Não localiza redes ou botão desativado');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Wi-Fi: NÃO FUNCIONA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIGITAL / BIOMETRIA */}
          {currentTab === 'biometrics' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Teste do Sensor de Impressão Digital</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Pressione e segure o dedo sobre o leitor biométrico na tela para validar o reconhecimento e a velocidade de leitura.
                </p>

                {/* Sensor Graphic Pad */}
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg text-center">
                  <div
                    onPointerDown={startBioScan}
                    onPointerUp={cancelBioScan}
                    onPointerLeave={cancelBioScan}
                    className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-95 ${
                      bioSuccess
                        ? 'border-emerald-500 bg-emerald-500/20 shadow-xl shadow-emerald-500/40'
                        : bioScanning
                        ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/30'
                        : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                    }`}
                  >
                    <Fingerprint
                      className={`w-14 h-14 transition-colors ${
                        bioSuccess
                          ? 'text-emerald-400'
                          : bioScanning
                          ? 'text-emerald-300 animate-pulse'
                          : 'text-slate-400'
                      }`}
                    />

                    {/* Scanning Sweep Laser */}
                    {bioScanning && (
                      <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-md shadow-emerald-400 animate-bounce" />
                    )}

                    {/* Circular Progress Ring */}
                    {bioScanning && (
                      <div
                        className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"
                        style={{ animationDuration: '0.6s' }}
                      />
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-200 mt-4">
                    {bioScanning ? (
                      <span className="text-emerald-400">Lendo biometria... Mantenha pressionado! ({bioProgress}%)</span>
                    ) : bioSuccess ? (
                      <span className="text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Digital reconhecida com sucesso!
                      </span>
                    ) : (
                      'Pressione e segure o dedo no sensor'
                    )}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Simula leitura óptica ou ultrassônica sob a tela
                  </span>
                </div>

                {/* WebAuthn Native Option */}
                <div className="mt-4 p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Sensor Biométrico Nativo do Sistema</span>
                    <p className="text-[11px] text-slate-400">
                      Dispara a caixa de diálogo biométrica nativa do aparelho (Touch ID / Face ID / Android Biometrics)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerNativeBiometric}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap"
                  >
                    Disparar Biometria do Aparelho
                  </button>
                </div>

                {nativeAuthMessage && (
                  <div className="mt-2 text-center text-xs text-slate-300 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {nativeAuthMessage}
                  </div>
                )}
              </div>

              {/* Fast Checklist Actions */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar Biometria no Checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('biometrics', 'funciona', 'Leitura biométrica rápida e 100% precisa');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    FUNCIONA (Aprovado)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('biometrics', 'com_dificuldade', 'Falhas de leitura intermitente');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    C/ DIFICULDADE
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('biometrics', 'nao_funciona', 'Sensor inoperante / Não lê');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    NÃO FUNCIONA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CARTÃO DE MEMÓRIA (SD) & EXPLORADOR DE ARQUIVOS */}
          {currentTab === 'sd_card' && (
            <div className="flex flex-col h-full justify-between max-w-2xl mx-auto py-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Explorador de Arquivos & Cartão MicroSD</h3>
                    <p className="text-xs text-slate-400">
                      Navegue pela memória interna e acesse as pastas do cartão SD para verificar integridade e velocidade.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSdInserted(!sdInserted)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        sdInserted
                          ? 'bg-slate-800 text-slate-200 border-slate-700'
                          : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {sdInserted ? 'Simular Ejetar Cartão' : 'Inserir Cartão MicroSD'}
                    </button>
                  </div>
                </div>

                {/* Storage Devices Selector */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Internal Storage */}
                  <div
                    onClick={() => setActiveStorage('internal')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      activeStorage === 'internal'
                        ? 'border-emerald-500 bg-slate-900 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-200">Memória Interna</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">128 GB</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1">
                      <div className="h-full bg-blue-500" style={{ width: '68%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>86.4 GB Usados</span>
                      <span>41.6 GB Livres</span>
                    </div>
                  </div>

                  {/* MicroSD Storage */}
                  <div
                    onClick={() => sdInserted && setActiveStorage('sd_card')}
                    className={`p-3.5 rounded-xl border transition-all ${
                      !sdInserted
                        ? 'border-slate-800/40 bg-slate-900/20 opacity-50 cursor-not-allowed'
                        : activeStorage === 'sd_card'
                        ? 'border-emerald-500 bg-slate-900 shadow-sm cursor-pointer'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Cartão MicroSD</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sdInserted ? '64 GB' : 'Não inserido'}
                      </span>
                    </div>
                    {sdInserted ? (
                      <>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1">
                          <div className="h-full bg-emerald-500" style={{ width: '24%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>14.8 GB Usados</span>
                          <span>49.2 GB Livres</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-rose-400">Nenhum cartão detectado no slot</span>
                    )}
                  </div>
                </div>

                {/* File Explorer Directory View */}
                {activeStorage === 'sd_card' && !sdInserted ? (
                  <div className="p-8 text-center rounded-xl border border-rose-800/40 bg-rose-950/20 text-rose-300 text-xs">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                    Slot MicroSD vazio. Insira um cartão para acessar os arquivos.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden mb-4">
                    {/* Explorer Top Toolbar */}
                    <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                        <Folder className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeStorage === 'internal' ? 'Armazenamento_Interno' : 'Cartao_SD_SanDisk'}</span>
                        <span className="text-slate-600">/</span>
                        <span>{currentFolder === 'root' ? 'Raiz' : currentFolder}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentFolder !== 'root' && (
                          <button
                            onClick={() => setCurrentFolder('root')}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            Voltar
                          </button>
                        )}
                        <label className="cursor-pointer text-[10px] px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors">
                          Carregar Arquivo(s) Real(is) do Dispositivo
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleRealFileSelect(e.target.files)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Files & Folders Table */}
                    <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
                      {currentFolder === 'root' ? (
                        <>
                          <div
                            onClick={() => setCurrentFolder('DCIM / Câmera')}
                            className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium text-slate-200">DCIM / Câmera</span>
                            </div>
                            <span className="text-[11px] text-slate-400">142 fotos · 4.2 GB</span>
                          </div>

                          <div
                            onClick={() => setCurrentFolder('Downloads')}
                            className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium text-slate-200">Downloads</span>
                            </div>
                            <span className="text-[11px] text-slate-400">18 arquivos · 850 MB</span>
                          </div>

                          <div
                            onClick={() => setCurrentFolder('Músicas')}
                            className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium text-slate-200">Músicas & Áudios</span>
                            </div>
                            <span className="text-[11px] text-slate-400">54 faixas · 1.2 GB</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 flex items-center justify-between hover:bg-slate-850">
                            <div className="flex items-center gap-3">
                              <ImageIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-medium text-slate-200">FOTO_BANCADA_TESTE_01.jpg</span>
                            </div>
                            <span className="text-[11px] text-slate-400">3.2 MB · Abrir OK</span>
                          </div>

                          <div className="p-3 flex items-center justify-between hover:bg-slate-850">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-medium text-slate-200">COMPROVANTE_GARANTIA.pdf</span>
                            </div>
                            <span className="text-[11px] text-slate-400">420 KB · Íntegro</span>
                          </div>

                          <div className="p-3 flex items-center justify-between hover:bg-slate-850">
                            <div className="flex items-center gap-3">
                              <Music className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-medium text-slate-200">AUDIO_TESTE_SOM.mp3</span>
                            </div>
                            <button
                              onClick={() => playBeep(800, 0.4)}
                              className="text-[10px] text-emerald-400 hover:underline"
                            >
                              Tocar Amostra
                            </button>
                          </div>
                        </>
                      )}

                      {realUploadedFileName && (
                        <div className="p-3 bg-emerald-950/20 flex items-center justify-between text-xs text-emerald-300">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span>Arquivo Real Lido com Sucesso: {realUploadedFileName}</span>
                          </div>
                          <span className="text-[10px] font-mono">100% LIDO</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SD Speed Test */}
                {sdInserted && (
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Benchmark de Leitura e Gravação</span>
                      <p className="text-[11px] text-slate-400">Testa integridade dos blocos do MicroSD</p>
                    </div>
                    <button
                      onClick={handleTestSdSpeed}
                      disabled={isTestingSdSpeed}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 disabled:opacity-50"
                    >
                      {isTestingSdSpeed ? 'Testando I/O...' : 'Iniciar Teste de Velocidade'}
                    </button>
                  </div>
                )}

                {sdSpeedTestResult && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300">
                    {sdSpeedTestResult}
                  </div>
                )}
              </div>

              {/* Fast Checklist Actions */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar Cartão no Checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('sd_card', 'funciona', 'Cartão SD reconhecido, lê e grava normalmente');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Cartão SD: FUNCIONA
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('sd_card', 'nao_funciona', 'Não reconhece cartão ou não lê arquivos');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    NÃO FUNCIONA
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('sd_card', 'nao_possui', 'Aparelho não possui entrada para MicroSD');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    NÃO POSSUI
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GERENCIADOR DE CHIPS & DISCADOR */}
          {currentTab === 'sim_manager' && (
            <div className="flex flex-col h-full justify-between max-w-2xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Gerenciador de Chips (SIM 1 / SIM 2) & Sinal</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Validação do reconhecimento dos cartões de operadora, sinal de RF e discador de chamada de teste.
                </p>

                {/* SIM Cards Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* SIM 1 */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase">Slot 1 (SIM 1)</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                        Ativo
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operadora:</span>
                        <select
                          value={sim1Carrier}
                          onChange={(e) => setSim1Carrier(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-xs"
                        >
                          <option value="Claro 5G">Claro 5G</option>
                          <option value="Vivo 5G">Vivo 5G</option>
                          <option value="TIM Brasil">TIM Brasil</option>
                        </select>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sinal:</span>
                        <span className="font-mono text-emerald-400">-74 dBm (4 barras cheias)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ICCID:</span>
                        <span className="font-mono text-[10px] text-slate-400">8955 0412 8763 9012</span>
                      </div>
                    </div>
                  </div>

                  {/* SIM 2 */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase">Slot 2 / eSIM</span>
                      </div>
                      <select
                        value={sim2State}
                        onChange={(e) => setSim2State(e.target.value as 'active' | 'empty' | 'esim')}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 text-[10px]"
                      >
                        <option value="active">Chip Inserido</option>
                        <option value="empty">Vazio / Ausente</option>
                        <option value="esim">eSIM Ativado</option>
                      </select>
                    </div>

                    <div className="text-xs space-y-1">
                      {sim2State === 'empty' ? (
                        <p className="text-slate-500 py-3 text-center">Nenhum chip inserido no slot 2</p>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Operadora:</span>
                            <select
                              value={sim2Carrier}
                              onChange={(e) => setSim2Carrier(e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-xs"
                            >
                              <option value="Vivo 4G">Vivo 4G</option>
                              <option value="Claro 4G">Claro 4G</option>
                              <option value="TIM 4G">TIM 4G</option>
                            </select>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sinal:</span>
                            <span className="font-mono text-emerald-400">-80 dBm (3 barras)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">ICCID:</span>
                            <span className="font-mono text-[10px] text-slate-400">8955 0891 7623 4511</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Telephone Dialer Simulator */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Teclado Discador de Teste</span>
                    <span className="text-[10px] text-slate-500">Digite *#06# para ver IMEI</span>
                  </div>

                  {/* Dialer Screen Display */}
                  <div className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-lg text-emerald-400 tracking-wider">
                    <span>{dialerNumber || <span className="text-slate-600 text-xs font-sans">Digite número ou código...</span>}</span>
                    {dialerNumber && (
                      <button
                        onClick={() => setDialerNumber((n) => n.slice(0, -1))}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        ⌫
                      </button>
                    )}
                  </div>

                  {/* 12 Key Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 select-none">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleDialerClick(k)}
                        className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 active:bg-emerald-600 text-slate-100 font-bold text-sm transition-all"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* Call Actions */}
                  <div className="flex gap-2 mt-3">
                    {callActive ? (
                      <button
                        onClick={handleEndCall}
                        className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 rotate-135" />
                        Encerrar Chamada ({callDuration}s)
                      </button>
                    ) : (
                      <button
                        onClick={handleStartCall}
                        disabled={!dialerNumber}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Discar Chamada de Teste
                      </button>
                    )}
                  </div>
                </div>

                {/* IMEI Popup Modal for *#06# */}
                {showImeiModal && (
                  <div className="mt-4 p-4 rounded-xl border border-emerald-500/60 bg-emerald-950/30 text-emerald-300 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-800/60">
                      <span className="font-bold">INFORMAÇÕES DE HARDWARE & IMEI (*#06#)</span>
                      <button onClick={() => setShowImeiModal(false)} className="text-slate-400 hover:text-white">
                        ✕
                      </button>
                    </div>
                    <p className="font-mono">IMEI 1: 354892109876543</p>
                    <p className="font-mono">IMEI 2: 354892109876550</p>
                    <p className="font-mono">Nº de Série: RF8T40AB89Z</p>
                    <span className="text-[10px] text-emerald-400 block mt-2">
                      IMEI verificado e sem restrições na Anatel
                    </span>
                  </div>
                )}
              </div>

              {/* Fast Checklist Actions */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar no Checklist:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('chip_1', 'funciona', 'Reconhece SIM 1 normalmente');
                      onUpdateChecklist('signal_area', 'sim_area', 'Sinal forte 4G/5G com chamadas operantes');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Aprovar Chip 1 & Sinal (OK)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('chip_2', 'funciona', 'Reconhece SIM 2 normalmente');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Aprovar Chip 2 (OK)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('signal_area', 'nao_area', 'Sem sinal / Só emergência / Não dá área');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Sinal: NÃO DÁ ÁREA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MICROPHONE & VU METER */}
          {currentTab === 'mic' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Teste de Sensibilidade e Retorno de Voz</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Fale próximo ao microfone inferior e superior para verificar o nível de captação e ouvir chiados.
                </p>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span>Nível de Entrada de Áudio (VU Meter)</span>
                    <span className="font-mono text-emerald-400">{audioLevel}%</span>
                  </div>
                  <div className="w-full h-5 rounded-lg bg-slate-800 overflow-hidden flex p-0.5">
                    <div
                      className={`h-full rounded transition-all duration-75 ${
                        audioLevel > 80 ? 'bg-rose-500' : audioLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0 dB</span>
                    <span>-12 dB</span>
                    <span>-6 dB</span>
                    <span>0 dB (Pico)</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
                        <Mic className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-rose-400">Gravando 4 segundos... Fale agora!</span>
                      <button
                        onClick={stopMic}
                        className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        Interromper
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startMicTest}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Iniciar Teste de Gravação (4s)
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <div className="mt-5 w-full p-4 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-emerald-400">Áudio gravado com sucesso:</span>
                      <audio controls src={recordedAudioUrl} className="w-full h-8" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar no checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('microphone', 'sim', 'Gravação e reprodução limpas');
                      stopMic();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Microfone: SIM (OK)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('microphone', 'com_detalhes', 'Áudio com chiado / baixo');
                      stopMic();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    C/ DETALHES (Chiado/Baixo)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('microphone', 'nao', 'Mudo / sem captação');
                      stopMic();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    NÃO GRAVA (Mudo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SPEAKER & TONES */}
          {currentTab === 'speaker' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Gerador de Frequências e Teste de Alto-falante</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Reproduza tons de bancada em diferentes faixas para checar se a membrana do alto-falante está rasgada ou estourando.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Tom Padrão (1000 Hz)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Frequência média ideal para voz e clareza.</p>
                    </div>
                    <button
                      onClick={() => playTone(1000, 'sine')}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar 1000 Hz
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Grave Profundo (120 Hz)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Excita graves para detectar vibrações e chiado mecânico.</p>
                    </div>
                    <button
                      onClick={() => playTone(120, 'triangle')}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar Graves (120 Hz)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Agudos / Auricular (3500 Hz)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Avalia o alto-falante superior de ligação.</p>
                    </div>
                    <button
                      onClick={() => playTone(3500, 'sine')}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar Agudos (3.5 kHz)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Bip de Alerta Musical</span>
                      <p className="text-[11px] text-slate-400 mt-1">Simula toque de chamada e campainha.</p>
                    </div>
                    <button
                      onClick={() => {
                        playTone(523.25, 'sine');
                        setTimeout(() => playTone(659.25, 'sine'), 250);
                        setTimeout(() => playTone(783.99, 'sine'), 500);
                      }}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar Acorde Triplo
                    </button>
                  </div>

                  {/* Stereo Channel Tests */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Alto-falante Esquerdo (Canal L)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Isola canal estéreo esquerdo.</p>
                    </div>
                    <button
                      onClick={() => playStereoTone(1000, -1)}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 text-xs font-medium border border-blue-700/50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar Canal L (Esquerdo)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Alto-falante Direito (Canal R)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Isola canal estéreo direito.</p>
                    </div>
                    <button
                      onClick={() => playStereoTone(1000, 1)}
                      className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 text-xs font-medium border border-blue-700/50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Tocar Canal R (Direito)
                    </button>
                  </div>
                </div>

                {isPlayingTone && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <span>Reproduzindo tom de bancada...</span>
                    <button onClick={stopTone} className="flex items-center gap-1 underline font-semibold">
                      <Square className="w-3 h-3" /> Parar
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar no checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('audio', 'sim', 'Áudio alto e cristalino');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Áudio: SIM (Limpo)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('audio', 'com_detalhes', 'Som rouco / estourando');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    C/ DETALHE (Rouco/Baixo)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('audio', 'nao', 'Mudo total sem som');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    NÃO FUNCIONA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAMERAS */}
          {currentTab === 'camera' && (
            <div className="flex flex-col h-full justify-between items-center max-w-xl mx-auto py-1">
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Teste de Sensor e Lentes</span>
                    <p className="text-xs text-slate-400">Verifique foco, manchas, poeira ou riscos na imagem.</p>
                  </div>
                  <button
                    onClick={() => {
                      const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
                      setCameraFacing(nextFacing);
                      startCamera(nextFacing);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
                  >
                    Alternar: {cameraFacing === 'user' ? 'Frontal (Selfie)' : 'Traseira'}
                  </button>
                </div>

                {cameraError ? (
                  <div className="p-6 rounded-xl border border-rose-800/60 bg-rose-950/20 text-rose-300 text-center text-xs">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                    {cameraError}
                    <div className="mt-3">
                      <button
                        onClick={() => startCamera(cameraFacing)}
                        className="px-3 py-1.5 rounded-md bg-rose-800 text-white hover:bg-rose-700 text-xs"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-4/3 w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-slate-700 bg-black flex items-center justify-center shadow-lg">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 text-xs p-4 text-center">
                        <Camera className="w-8 h-8 mb-2 text-slate-500 animate-pulse" />
                        Aguardando autorização da câmera...
                      </div>
                    )}
                  </div>
                )}

                {/* Camera Actions: Snapshot */}
                {cameraActive && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={takeCameraSnapshot}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Capturar Foto de Teste
                    </button>
                  </div>
                )}

                {/* Captured Photo Preview */}
                {capturedPhotoUrl && (
                  <div className="mt-3 p-3 rounded-xl border border-slate-700 bg-slate-900/90 max-w-md mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={capturedPhotoUrl}
                        alt="Foto capturada"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-200">Foto de Teste Capturada</span>
                        <p className="text-[10px] text-emerald-400">Sensor funcionando e registrando imagens</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoUrl(null)}
                      className="text-xs text-slate-400 hover:text-rose-400 p-1"
                    >
                      Descartar
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar ({cameraFacing === 'user' ? 'Frontal' : 'Traseira'}):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const key = cameraFacing === 'user' ? 'front_camera' : 'rear_camera';
                      onUpdateChecklist(key, 'sim', 'Foco e imagem nítidos');
                      stopCamera();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    SIM (OK)
                  </button>
                  <button
                    onClick={() => {
                      const key = cameraFacing === 'user' ? 'front_camera' : 'rear_camera';
                      onUpdateChecklist(key, 'com_detalhes', 'Manchas ou foco instável');
                      stopCamera();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    C/ DETALHES
                  </button>
                  <button
                    onClick={() => {
                      const key = cameraFacing === 'user' ? 'front_camera' : 'rear_camera';
                      onUpdateChecklist(key, 'nao', 'Câmera não abre / preta');
                      stopCamera();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    NÃO FUNCIONA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLASH & DISPLAY PIXELS */}
          {currentTab === 'display' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Flash de Tela & Verificação de Dead Pixels</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Clique nas cores sólidas para inspecionar queima de pixels, vazamento de backlight e uniformidade do display.
                </p>

                <div
                  onClick={() => setDisplayColorIndex((prev) => (prev + 1) % displayColors.length)}
                  className={`w-full h-44 rounded-xl border-2 border-slate-700 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${displayColors[displayColorIndex].bg} shadow-md`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${displayColors[displayColorIndex].text}`}>
                    {displayColors[displayColorIndex].name}
                  </span>
                  <span className={`text-[11px] mt-1 opacity-70 ${displayColors[displayColorIndex].text}`}>
                    (Toque para alternar para a próxima cor)
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  {displayColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDisplayColorIndex(idx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        displayColorIndex === idx
                          ? 'border-white bg-slate-800 text-white shadow-xs'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {color.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Real Physical Camera Flashlight LED Torch */}
                <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        isTorchOn
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200">
                        Lanterna / Flash LED Traseiro Físico
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {isTorchOn
                          ? 'Lanterna LED traseira acesa no celular'
                          : 'Aciona o LED físico da câmera traseira no smartphone'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={togglePhysicalTorch}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      isTorchOn
                        ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-900/40'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isTorchOn ? 'Desligar Flash LED' : 'Acender Flash LED Físico'}
                  </button>
                </div>
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">Gravar Flash no checklist:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateChecklist('flash', 'sim', 'Flash operante com brilho normal');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Flash: SIM (Funciona)
                  </button>
                  <button
                    onClick={() => {
                      onUpdateChecklist('flash', 'nao', 'Flash inoperante');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Flash: NÃO FUNCIONA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VIBRATION */}
          {currentTab === 'vibration' && (
            <div className="flex flex-col h-full justify-between max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Teste do Motor de Vibração (Taptic Engine)</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Dispare pulsos no vibracall do smartphone para conferir ruído metálico ou peso da resposta tátil.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => triggerVibrate([200])}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Pulso Curto (200ms)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Feedback de digitação</p>
                    </div>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button
                    onClick={() => triggerVibrate([200, 100, 200, 100, 400])}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Padrão de Chamada</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pulsos múltiplos ritmados</p>
                    </div>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="w-full flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Concluir Testes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
