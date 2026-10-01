import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline capabilities and PWA compliance
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do aplicativo disponível.');
  },
  onOfflineReady() {
    console.log('Aplicativo pronto para operar em modo offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
