import { ServiceOrder } from '../types/order';
import { createEmptyChecklist } from '../data/initialChecklist';

const STORAGE_KEY = 'techcheck_service_orders_v1';
const ACTIVE_ORDER_ID_KEY = 'techcheck_active_order_id';

export const generateOrderNumber = (): string => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `OS-${year}-${randomSuffix}`;
};

export const createNewOrder = (type: 'entry' | 'exit' = 'entry'): ServiceOrder => {
  const now = new Date().toISOString();
  return {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderNumber: generateOrderNumber(),
    createdAt: now,
    updatedAt: now,
    checklistType: type,
    status: 'in_analysis',
    customer: {
      name: '',
      phone: '',
      document: '',
      email: '',
    },
    device: {
      brand: 'Samsung',
      model: '',
      color: '',
      imei: '',
      serialNumber: '',
      lockType: 'pin',
      lockPassword: '',
      patternNodes: [],
      accessories: {
        charger: false,
        cable: false,
        case: true,
        screenProtector: true,
        simCardLeft: false,
        memoryCardLeft: false,
        other: '',
      },
      physicalCondition: {
        screenCracked: false,
        scratches: false,
        dents: false,
        backCoverBroken: false,
        missingScrews: false,
        bentHousing: false,
        waterDamageIndication: false,
        notes: '',
      },
    },
    checklist: createEmptyChecklist(),
    budget: {
      technicianName: 'Bancada Lab 01',
      reportedDefect: '',
      technicalDiagnosis: '',
      servicesCost: 0,
      partsCost: 0,
      discount: 0,
      totalCost: 0,
      warrantyDays: 90,
    },
  };
};

export const SAMPLE_ORDERS: ServiceOrder[] = [
  {
    id: 'ord_demo_samsung_s23',
    orderNumber: 'OS-2026-8812',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    checklistType: 'entry',
    status: 'in_analysis',
    customer: {
      name: 'Marcos Vinicius Ribeiro',
      phone: '(11) 98765-4321',
      document: '321.654.987-00',
      email: 'marcos.v@email.com',
    },
    device: {
      brand: 'Samsung',
      model: 'Galaxy S23 128GB',
      color: 'Preto Fantasma',
      imei: '354892109876543',
      serialNumber: 'RF8T40AB89Z',
      lockType: 'pattern',
      lockPassword: 'Padrão L',
      patternNodes: [0, 3, 6, 7, 8],
      accessories: {
        charger: false,
        cable: true,
        case: true,
        screenProtector: false,
        simCardLeft: true,
        memoryCardLeft: false,
        other: 'Cabo USB-C original',
      },
      physicalCondition: {
        screenCracked: true,
        scratches: true,
        dents: false,
        backCoverBroken: false,
        missingScrews: false,
        bentHousing: false,
        waterDamageIndication: false,
        notes: 'Vidro trincado no canto superior direito. Aro com marcas leves de uso.',
      },
    },
    checklist: {
      power_button: { status: 'sim', observation: 'Clique firme' },
      touch_screen: { status: 'mau_toque', observation: 'Falha intermitente na linha superior onde o vidro trincou' },
      flash: { status: 'sim', observation: '' },
      wifi: { status: 'sim', observation: 'Conectou na rede 5GHz bancada' },
      front_camera: { status: 'com_detalhes', observation: 'Risco superficial sobre a lente frontal' },
      rear_camera: { status: 'sim', observation: 'Foco e zoom 3x perfeitos' },
      microphone: { status: 'sim', observation: '' },
      audio: { status: 'com_detalhes', observation: 'Grelha auricular levemente suja com som baixo' },
      volume_up: { status: 'sim', observation: '' },
      volume_down: { status: 'sim', observation: '' },
      biometrics: { hasItem: true, status: 'funciona', observation: 'Sensor ultrassônico na tela cadastrado' },
      aux_button: { hasItem: false, status: 'nao_funciona', observation: 'Modelo não possui botão extra' },
      chip_tray: { status: 'sim', observation: 'Bandeja com borracha íntegra' },
      sd_card: { status: 'nao_possui', observation: 'S23 não possui slot microSD' },
      chip_1: { status: 'funciona', observation: 'Claro 5G reconhecido' },
      chip_2: { status: 'nao_possui', observation: 'Slot 2 vazio / aparelho single sim físico' },
      signal_area: { status: 'sim_area', observation: '4 barras 5G' },
    },
    budget: {
      technicianName: 'Carlos Tech',
      reportedDefect: 'Aparelho sofreu queda. Tela trincou e touch falha às vezes.',
      technicalDiagnosis: 'Necessária troca do módulo frontal original (Amoled + Touch). Limpeza preventiva da grelha auricular.',
      servicesCost: 150,
      partsCost: 680,
      discount: 30,
      totalCost: 800,
      warrantyDays: 90,
    },
  },
  {
    id: 'ord_demo_iphone_13',
    orderNumber: 'OS-2026-9420',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    checklistType: 'exit',
    status: 'ready',
    customer: {
      name: 'Beatriz Almeida Costa',
      phone: '(21) 97123-8899',
      document: '456.789.123-44',
      email: 'beatriz.ac@gmail.com',
    },
    device: {
      brand: 'Apple',
      model: 'iPhone 13 128GB',
      color: 'Azul Meia-Noite',
      imei: '359871029384756',
      serialNumber: 'DX3F9A1P0K',
      lockType: 'pin',
      lockPassword: '1 9 8 4 2 0',
      patternNodes: [],
      accessories: {
        charger: false,
        cable: false,
        case: true,
        screenProtector: true,
        simCardLeft: false,
        memoryCardLeft: false,
        other: 'Capinha de silicone transparente',
      },
      physicalCondition: {
        screenCracked: false,
        scratches: false,
        dents: false,
        backCoverBroken: false,
        missingScrews: false,
        bentHousing: false,
        waterDamageIndication: false,
        notes: 'Aparelho em excelente estado estético.',
      },
    },
    checklist: {
      power_button: { status: 'sim', observation: '100% OK' },
      touch_screen: { status: 'sim', observation: 'Display novo testado e aprovado' },
      flash: { status: 'sim', observation: 'OK' },
      wifi: { status: 'sim', observation: 'Redes 2.4 e 5G OK' },
      front_camera: { status: 'sim', observation: 'Face ID e fotos frontais OK' },
      rear_camera: { status: 'sim', observation: '0.5x e 1x funcionando' },
      microphone: { status: 'sim', observation: 'Áudio limpo no gravador' },
      audio: { status: 'sim', observation: 'Som estéreo alto e claro' },
      volume_up: { status: 'sim', observation: 'OK' },
      volume_down: { status: 'sim', observation: 'OK' },
      biometrics: { hasItem: false, status: 'nao_funciona', observation: 'Face ID (sem Touch ID)' },
      aux_button: { hasItem: true, status: 'funciona', observation: 'Chave de silencioso funcionando' },
      chip_tray: { status: 'sim', observation: 'OK' },
      sd_card: { status: 'nao_possui', observation: 'Apple sem suporte a SD' },
      chip_1: { status: 'funciona', observation: 'Vivo testado com sucesso' },
      chip_2: { status: 'nao_possui', observation: 'eSIM não configurado' },
      signal_area: { status: 'sim_area', observation: 'Sinal 4G/5G cheio' },
    },
    budget: {
      technicianName: 'Rodrigo Especialista',
      reportedDefect: 'Troca de bateria (saúde em 72%) e instalação de película 3D.',
      technicalDiagnosis: 'Bateria substituída com sucesso por peça premium original. Calibração realizada.',
      servicesCost: 120,
      partsCost: 280,
      discount: 20,
      totalCost: 380,
      warrantyDays: 180,
    },
  },
];

export const loadOrdersFromStorage = (): ServiceOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
      return SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_ORDERS;
  } catch (e) {
    console.error('Falha ao ler ordens do localStorage', e);
    return SAMPLE_ORDERS;
  }
};

export const saveOrdersToStorage = (orders: ServiceOrder[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Falha ao salvar ordens no localStorage', e);
  }
};

export const getActiveOrderId = (): string | null => {
  return localStorage.getItem(ACTIVE_ORDER_ID_KEY);
};

export const setActiveOrderId = (id: string) => {
  localStorage.setItem(ACTIVE_ORDER_ID_KEY, id);
};

export const buildWhatsAppMessage = (order: ServiceOrder): string => {
  const typeLabel = order.checklistType === 'entry' ? 'CHECKLIST DE ENTRADA' : 'CHECKLIST DE SAÍDA';
  const customerName = order.customer.name || 'Cliente';
  const deviceName = `${order.device.brand} ${order.device.model || 'Aparelho'}`;
  
  let text = `*RELATÓRIO TÉCNICO - ${order.orderNumber}*\n`;
  text += `📋 Tipo: *${typeLabel}*\n`;
  text += `👤 Cliente: *${customerName}*\n`;
  text += `📱 Aparelho: *${deviceName}* (${order.device.color || 'Cor não inf.'})\n`;
  if (order.device.imei) text += `🔢 IMEI: \`${order.device.imei}\`\n`;
  text += `\n*── ITENS DO CHECKLIST DE TESTES ──*\n`;

  const checklistMap: { [k: string]: string } = {
    power_button: 'Botão Ligar',
    touch_screen: 'Toque na Tela',
    flash: 'Flash / Lanterna',
    wifi: 'Wi-Fi',
    front_camera: 'Câmera Frontal',
    rear_camera: 'Câmera Traseira',
    microphone: 'Microfone',
    audio: 'Áudio / Alto-falante',
    volume_up: 'Botão Volume (+)',
    volume_down: 'Botão Volume (-)',
    biometrics: 'Digital / Biometria',
    aux_button: 'Botão Auxiliar',
    chip_tray: 'Gaveta do Chip',
    sd_card: 'Cartão de Memória',
    chip_1: 'Chip 1',
    chip_2: 'Chip 2',
    signal_area: 'Sinal de Área',
  };

  for (const [key, state] of Object.entries(order.checklist)) {
    const label = checklistMap[key] || key;
    let icon = '⚪';
    let statusText = state.status.toUpperCase();

    if (['sim', 'funciona', 'sim_area'].includes(state.status)) {
      icon = '✅';
      statusText = 'OK / FUNCIONANDO';
    } else if (['nao', 'nao_funciona', 'nao_area'].includes(state.status)) {
      icon = '❌';
      statusText = 'NÃO FUNCIONA';
    } else if (['com_dificuldade', 'mau_toque', 'com_detalhes', 'com_problema'].includes(state.status)) {
      icon = '⚠️';
      statusText = 'C/ RESSALVA / DIFICULDADE';
    } else if (['nao_possui'].includes(state.status)) {
      icon = '➖';
      statusText = 'NÃO POSSUI';
    }

    if (key === 'biometrics' && state.hasItem === false) {
      icon = '➖';
      statusText = 'NÃO POSSUI';
    }
    if (key === 'aux_button' && state.hasItem === false) {
      icon = '➖';
      statusText = 'NÃO POSSUI';
    }

    text += `${icon} *${label}*: ${statusText}`;
    if (state.observation) {
      text += ` _(Obs: ${state.observation})_`;
    }
    text += `\n`;
  }

  if (order.budget.technicalDiagnosis) {
    text += `\n🔬 *Laudo Técnico:* ${order.budget.technicalDiagnosis}\n`;
  }
  if (order.budget.totalCost > 0) {
    text += `💰 *Valor Total:* R$ ${order.budget.totalCost.toFixed(2)} (Garantia: ${order.budget.warrantyDays} dias)\n`;
  }

  text += `\n_Emitido via TechCheck Bancada Técnica_`;
  return text;
};
