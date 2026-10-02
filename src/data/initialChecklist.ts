import { ChecklistItemConfig, ChecklistRecord } from '../types/order';

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  {
    key: 'power_button',
    title: 'Botão Ligar (Power)',
    subtitle: 'Acionamento e resposta de tela',
    iconName: 'Power',
    quickNotes: ['Travando', 'Afundado', 'Sem clique tátil', 'Reiniciando sozinho'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (OK)', tone: 'success', description: 'Liga e desliga com clique perfeito' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'Inoperante / Não liga o aparelho' },
      { id: 'com_dificuldade', label: 'C/ DIFICULDADE', shortLabel: 'C/ DIFICULDADE', tone: 'warning', description: 'Botão duro, afundado ou falhando' },
    ],
  },
  {
    key: 'touch_screen',
    title: 'Toque na Tela (Touch)',
    subtitle: 'Sensibilidade e precisão do painel touch',
    iconName: 'Touchpad',
    testType: 'touch',
    quickNotes: ['Toque fantasma', 'Zona morta no topo', 'Linhas de falha', 'Deslize falha'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Perfeito)', tone: 'success', description: 'Toque responde 100% em toda a tela' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO RESPONDE', tone: 'danger', description: 'Touch completamente inoperante' },
      { id: 'mau_toque', label: 'MAU TOQUE', shortLabel: 'MAU TOQUE', tone: 'warning', description: 'Toque fantasma, atrasos ou faixas mortas' },
    ],
  },
  {
    key: 'flash',
    title: 'Flash / Lanterna',
    subtitle: 'LED de iluminação da câmera traseira',
    iconName: 'Zap',
    testType: 'flash',
    quickNotes: ['LED fraco', 'Piscando irregular', 'Desativa por aquecimento'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Funciona)', tone: 'success', description: 'Flash e lanterna acendem com brilho total' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO ACENDE', tone: 'danger', description: 'Flash inoperante ou queimado' },
    ],
  },
  {
    key: 'wifi',
    title: 'Wi-Fi',
    subtitle: 'Recepção e conexão de rede sem fio',
    iconName: 'Wifi',
    testType: 'wifi',
    quickNotes: ['Não ativa botão', 'Sinal muito fraco ao afastar', 'Cai a cada minuto'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Conecta)', tone: 'success', description: 'Localiza redes e conecta normalmente' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO CONECTA', tone: 'danger', description: 'Wi-Fi cinza/desativado ou sem sinal' },
    ],
  },
  {
    key: 'front_camera',
    title: 'Câmera Frontal',
    subtitle: 'Sensor selfie e videochamadas',
    iconName: 'Camera',
    testType: 'camera_front',
    quickNotes: ['Mancha preta', 'Foco embaçado', 'Vidro sujo/riscado internamente'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (OK)', tone: 'success', description: 'Imagem nítida e foco perfeito' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO ABRE', tone: 'danger', description: 'Tela preta, trava aplicativo de foto' },
      { id: 'com_detalhes', label: 'C/ DETALHES', shortLabel: 'C/ DETALHES', tone: 'warning', description: 'Manchas, riscos, embaçamento ou foco instável' },
    ],
  },
  {
    key: 'rear_camera',
    title: 'Câmera Traseira',
    subtitle: 'Sensor principal e estabilização',
    iconName: 'Camera',
    testType: 'camera_rear',
    quickNotes: ['Lente trincada', 'Tremendo / Zumbindo no foco', 'Manchas de poeira'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (OK)', tone: 'success', description: 'Foco rápido, estabilização e foto nítida' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO ABRE', tone: 'danger', description: 'Câmera inoperante ou travando' },
      { id: 'com_detalhes', label: 'C/ DETALHES', shortLabel: 'C/ DETALHES', tone: 'warning', description: 'Lente trincada, foco oscilando ou manchas' },
    ],
  },
  {
    key: 'microphone',
    title: 'Microfone',
    subtitle: 'Captação de chamadas e áudio WhatsApp',
    iconName: 'Mic',
    testType: 'microphone',
    quickNotes: ['Som baixo / abafado', 'Chiado de fundo', 'Só funciona no viva-voz'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Limpo)', tone: 'success', description: 'Grava e transmite voz limpa e alta' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO GRAVA', tone: 'danger', description: 'Mudo total em chamadas e gravações' },
      { id: 'com_detalhes', label: 'C/ DETALHES', shortLabel: 'C/ DETALHES', tone: 'warning', description: 'Voz baixa, chiado, eco ou distorção' },
    ],
  },
  {
    key: 'audio',
    title: 'Áudio (Alto-falante / Auricular)',
    subtitle: 'Saída de som para campainha e ligação',
    iconName: 'Volume2',
    testType: 'speaker',
    quickNotes: ['Som estourado / rasgado', 'Auricular mudo', 'Grelha entupida'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Limpo)', tone: 'success', description: 'Som claro tanto no viva-voz quanto auricular' },
      { id: 'nao', label: 'NÃO', shortLabel: 'SEM ÁUDIO', tone: 'danger', description: 'Aparelho mudo sem reprodução de som' },
      { id: 'com_detalhes', label: 'C/ DETALHE', shortLabel: 'C/ DETALHE', tone: 'warning', description: 'Som rouco, abafado, estourando ou baixo' },
    ],
  },
  {
    key: 'volume_up',
    title: 'Botão Volume (+)',
    subtitle: 'Aumento de volume físico',
    iconName: 'PlusCircle',
    testType: 'volume',
    quickNotes: ['Afundado', 'Não dá clique', 'Aumenta sozinho'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (OK)', tone: 'success', description: 'Aumenta com clique tátil firme' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO RESPONDE', tone: 'danger', description: 'Botão inoperante' },
      { id: 'com_dificuldade', label: 'C/ DIFICULDADE', shortLabel: 'C/ DIFICULDADE', tone: 'warning', description: 'Duro, afundado ou emperrado' },
    ],
  },
  {
    key: 'volume_down',
    title: 'Botão Volume (-)',
    subtitle: 'Redução de volume físico',
    iconName: 'MinusCircle',
    testType: 'volume',
    quickNotes: ['Afundado', 'Não dá clique', 'Diminui sozinho'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (OK)', tone: 'success', description: 'Diminui com clique tátil firme' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO RESPONDE', tone: 'danger', description: 'Botão inoperante' },
      { id: 'com_dificuldade', label: 'C/ DIFICULDADE', shortLabel: 'C/ DIFICULDADE', tone: 'warning', description: 'Duro, afundado ou emperrado' },
    ],
  },
  {
    key: 'biometrics',
    title: 'Digital / Biometria',
    subtitle: 'Sensor de impressão digital ou Touch ID',
    iconName: 'Fingerprint',
    hasPresenceToggle: true,
    presenceLabel: 'Possui Biometria',
    testType: 'biometrics',
    quickNotes: ['Sensor arranhado', 'Erro de leitura recorrente', 'Opção sumiu no menu'],
    options: [
      { id: 'funciona', label: 'FUNCIONA', shortLabel: 'FUNCIONA', tone: 'success', description: 'Cadastra e desbloqueia rapidamente' },
      { id: 'nao_funciona', label: 'NÃO FUNCIONA', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'Sensor não reconhece ou dá falha' },
      { id: 'com_dificuldade', label: 'C/ DIFICULDADE', shortLabel: 'C/ DIFICULDADE', tone: 'warning', description: 'Leitura intermitente ou muito lenta' },
    ],
  },
  {
    key: 'aux_button',
    title: 'Botão Auxiliar',
    subtitle: 'Chave silenciador / Ação / Bixby',
    iconName: 'Sliders',
    hasPresenceToggle: true,
    presenceLabel: 'Possui Botão Auxiliar',
    quickNotes: ['Chave frouxa', 'Dispara sozinho', 'Travado'],
    options: [
      { id: 'funciona', label: 'FUNCIONA', shortLabel: 'FUNCIONA', tone: 'success', description: 'Alterna comandos perfeitamente' },
      { id: 'nao_funciona', label: 'NÃO FUNCIONA', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'Sem resposta ao acionamento' },
    ],
  },
  {
    key: 'chip_tray',
    title: 'Gaveta do Chip',
    subtitle: 'Bandeja do cartão SIM e ejetor',
    iconName: 'Inbox',
    quickNotes: ['Sem borracha de vedação', 'Encaixe quebrado', 'Travada no orifício'],
    options: [
      { id: 'sim', label: 'SIM', shortLabel: 'SIM (Perfeita)', tone: 'success', description: 'Bandeja íntegra e ejeta suavemente' },
      { id: 'nao', label: 'NÃO', shortLabel: 'NÃO / AUSENTE', tone: 'danger', description: 'Cliente deixou aparelho sem a gaveta' },
      { id: 'com_problema', label: 'C/ PROBLEMA', shortLabel: 'C/ PROBLEMA', tone: 'warning', description: 'Trincada, torta, frouxa ou emperrada' },
    ],
  },
  {
    key: 'sd_card',
    title: 'Cartão de Memória (SD)',
    subtitle: 'Slot de expansão MicroSD',
    iconName: 'CreditCard',
    testType: 'sd_card',
    quickNotes: ['Pede formatação contínua', 'Não trava na mola', 'Sem leitor no modelo'],
    options: [
      { id: 'funciona', label: 'FUNCIONA', shortLabel: 'FUNCIONA', tone: 'success', description: 'Lê e grava arquivos no cartão SD' },
      { id: 'nao_funciona', label: 'NÃO FUNCIONA', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'Não reconhece cartão inserido' },
      { id: 'nao_possui', label: 'NÃO POSSUI', shortLabel: 'NÃO POSSUI / N/A', tone: 'neutral', description: 'Aparelho não possui entrada MicroSD' },
    ],
  },
  {
    key: 'chip_1',
    title: 'Chip 1 (Slot SIM 1)',
    subtitle: 'Leitura de chip da operadora principal',
    iconName: 'Cpu',
    testType: 'sim_manager',
    quickNotes: ['Não lê contatos', 'Sem serviço no SIM 1', 'Pino do leitor torto'],
    options: [
      { id: 'funciona', label: 'FUNCIONA', shortLabel: 'FUNCIONA', tone: 'success', description: 'Reconhece o chip 1 imediatamente' },
      { id: 'nao_funciona', label: 'NÃO FUNCIONA', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'SIM 1 não reconhecido / sem cartão' },
    ],
  },
  {
    key: 'chip_2',
    title: 'Chip 2 (Slot SIM 2 / eSIM)',
    subtitle: 'Leitura de chip secundário ou virtual',
    iconName: 'Cpu',
    testType: 'sim_manager',
    quickNotes: ['Slot híbrido não lê', 'Sem eSIM ativado', 'Aparelho single SIM'],
    options: [
      { id: 'funciona', label: 'FUNCIONA', shortLabel: 'FUNCIONA', tone: 'success', description: 'Reconhece o chip 2 normalmente' },
      { id: 'nao_funciona', label: 'NÃO FUNCIONA', shortLabel: 'NÃO FUNCIONA', tone: 'danger', description: 'SIM 2 não reconhecido ou falha' },
      { id: 'nao_possui', label: 'NÃO POSSUI', shortLabel: 'SINGLE SIM', tone: 'neutral', description: 'Aparelho modelo mono chip (1 SIM)' },
    ],
  },
  {
    key: 'signal_area',
    title: 'Sinal da Rede / Área',
    subtitle: 'Recepção de sinal celular 4G/5G',
    iconName: 'Signal',
    testType: 'signal_area',
    quickNotes: ['Só emergência', 'Possível restrição/bloqueio IMEI', 'Sinal oscilando'],
    options: [
      { id: 'sim_area', label: 'SIM DÁ ÁREA', shortLabel: 'SIM DÁ ÁREA', tone: 'success', description: 'Sinal de rede ativo, faz e recebe chamadas' },
      { id: 'nao_area', label: 'NÃO DÁ ÁREA', shortLabel: 'NÃO DÁ ÁREA', tone: 'danger', description: 'Sem serviço / Só emergência / Sem sinal' },
    ],
  },
  {
    key: 'charging_port',
    title: 'Conector de Carga / Carregamento',
    subtitle: 'Entrada de voltagem e amperagem em tempo real',
    iconName: 'Zap',
    testType: 'charging',
    quickNotes: ['Conector com folga', 'Carga lenta', 'Não reconhece carregador', 'Aquecendo conector'],
    options: [
      { id: 'sim', label: 'CARREGA NORMAL (SIM)', shortLabel: 'CARREGA (OK)', tone: 'success', description: 'Reconhece carregador e corrente flui perfeitamente' },
      { id: 'com_dificuldade', label: 'CARGA LENTA / MAU CONTATO', shortLabel: 'CARGA LENTA', tone: 'warning', description: 'Cabo precisa de jeitinho ou corrente oscilando' },
      { id: 'nao', label: 'NÃO CARREGA', shortLabel: 'NÃO CARREGA', tone: 'danger', description: 'Conector danificado / Não passa corrente' },
    ],
  },
];

export const createDefaultChecklist = (): ChecklistRecord => {
  return {
    power_button: { status: 'sim', observation: '' },
    touch_screen: { status: 'sim', observation: '' },
    flash: { status: 'sim', observation: '' },
    wifi: { status: 'sim', observation: '' },
    front_camera: { status: 'sim', observation: '' },
    rear_camera: { status: 'sim', observation: '' },
    microphone: { status: 'sim', observation: '' },
    audio: { status: 'sim', observation: '' },
    volume_up: { status: 'sim', observation: '' },
    volume_down: { status: 'sim', observation: '' },
    biometrics: { hasItem: true, status: 'funciona', observation: '' },
    aux_button: { hasItem: false, status: 'nao_funciona', observation: '' },
    chip_tray: { status: 'sim', observation: '' },
    sd_card: { status: 'nao_possui', observation: '' },
    chip_1: { status: 'funciona', observation: '' },
    chip_2: { status: 'nao_possui', observation: '' },
    signal_area: { status: 'sim_area', observation: '' },
    charging_port: { status: 'sim', observation: '' },
  };
};

export const createEmptyChecklist = (): ChecklistRecord => {
  const record = {} as ChecklistRecord;
  CHECKLIST_ITEMS.forEach((item) => {
    record[item.key] = {
      hasItem: item.hasPresenceToggle ? true : undefined,
      status: '',
      observation: '',
    };
  });
  return record;
};
