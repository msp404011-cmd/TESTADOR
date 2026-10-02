import { ChecklistRecord, ChecklistItemKey, ChecklistItemConfig } from '../types/order';
import { CHECKLIST_ITEMS } from '../data/initialChecklist';

export interface ReportSummaryStats {
  total: number;
  approved: number;
  details: number;
  failed: number;
  notApplicable: number;
  untested: number;
}

export function calculateReportStats(checklist: ChecklistRecord): ReportSummaryStats {
  let approved = 0;
  let details = 0;
  let failed = 0;
  let notApplicable = 0;
  let untested = 0;

  CHECKLIST_ITEMS.forEach((item: ChecklistItemConfig) => {
    const state = checklist[item.key as ChecklistItemKey];
    if (!state || !state.status) {
      untested++;
    } else if (
      state.status === 'sim' ||
      state.status === 'funciona' ||
      state.status === 'sim_area' ||
      state.status === 'completo'
    ) {
      approved++;
    } else if (
      state.status === 'com_detalhes' ||
      state.status === 'com_dificuldade' ||
      state.status === 'mau_toque' ||
      state.status === 'parcial'
    ) {
      details++;
    } else if (
      state.status === 'nao' ||
      state.status === 'nao_funciona' ||
      state.status === 'nao_area' ||
      state.status === 'inoperante'
    ) {
      failed++;
    } else if (state.status === 'nao_possui' || state.status === 'sem_leitor') {
      notApplicable++;
    } else {
      details++;
    }
  });

  return {
    total: CHECKLIST_ITEMS.length,
    approved,
    details,
    failed,
    notApplicable,
    untested,
  };
}

export async function generateTestReportImage(
  checklist: ChecklistRecord,
  deviceInfo?: {
    brand?: string;
    model?: string;
    osName?: string;
    osVersion?: string;
    ramText?: string;
    storageText?: string;
    screenText?: string;
    color?: string;
    imei?: string;
  }
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o canvas');

  const width = 1200;
  const items = CHECKLIST_ITEMS;
  const rowHeight = 64;
  const headerHeight = 350;
  const footerHeight = 120;
  const height = headerHeight + Math.ceil(items.length / 2) * rowHeight + footerHeight;

  canvas.width = width;
  canvas.height = height;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#020617'); // slate-950
  bgGrad.addColorStop(1, '#0f172a'); // slate-900
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Top Glow Accent
  const lineGrad = ctx.createLinearGradient(32, 0, width - 32, 0);
  lineGrad.addColorStop(0, '#2563eb');
  lineGrad.addColorStop(0.5, '#10b981');
  lineGrad.addColorStop(1, '#06b6d4');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(32, 28);
  ctx.lineTo(width - 32, 28);
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillText('DIAGNÓSTICO E TESTE DE CELULAR', 50, 78);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('✓ LAUDO COMPLETO DE HARDWARE & COMPONENTES', 50, 108);

  // Date and Time
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Emitido em: ${dateStr} às ${timeStr}`, 50, 136);

  // Real Device Info Card in Header
  const devTitle = [deviceInfo?.brand, deviceInfo?.model].filter(Boolean).join(' ') || 'Smartphone';
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 155, width - 100, 70);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 155, width - 100, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`📱 ${devTitle}`, 68, 185);

  const specsList = [
    deviceInfo?.osName ? `🤖 ${deviceInfo.osName} ${deviceInfo.osVersion || ''}`.trim() : '',
    deviceInfo?.ramText && deviceInfo.ramText !== 'Não disponível' ? `💾 ${deviceInfo.ramText}` : '',
    deviceInfo?.screenText && deviceInfo.screenText !== 'Não disponível' ? `📺 ${deviceInfo.screenText}` : '',
  ].filter(Boolean);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText(specsList.join('   •   ') || 'Dados de hardware detectados do dispositivo', 68, 210);

  // Summary Metrics Badges
  const stats = calculateReportStats(checklist);
  const badgeY = 245;

  const badges = [
    { label: 'APROVADOS', value: `${stats.approved}`, color: '#10b981', bg: '#064e3b' },
    { label: 'C/ DETALHES', value: `${stats.details}`, color: '#f59e0b', bg: '#78350f' },
    { label: 'REPROVADOS', value: `${stats.failed}`, color: '#ef4444', bg: '#7f1d1d' },
    { label: 'NÃO POSSUI', value: `${stats.notApplicable}`, color: '#94a3b8', bg: '#1e293b' },
    { label: 'TOTAL TESTADOS', value: `${stats.total - stats.untested}/${stats.total}`, color: '#38bdf8', bg: '#0c4a6e' },
  ];

  let currentBadgeX = 50;
  badges.forEach((b) => {
    const badgeW = 205;
    ctx.fillStyle = b.bg;
    ctx.fillRect(currentBadgeX, badgeY, badgeW, 58);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(currentBadgeX, badgeY, badgeW, 58);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(b.label, currentBadgeX + 16, badgeY + 22);

    ctx.fillStyle = b.color;
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(b.value, currentBadgeX + 16, badgeY + 48);

    currentBadgeX += badgeW + 18;
  });

  // Checklist Items in 2 Columns
  const startY = headerHeight + 10;
  const colWidth = (width - 130) / 2;

  items.forEach((item, index) => {
    const isCol2 = index >= Math.ceil(items.length / 2);
    const colIndex = isCol2 ? index - Math.ceil(items.length / 2) : index;
    const x = isCol2 ? 50 + colWidth + 30 : 50;
    const y = startY + colIndex * rowHeight;

    const state = checklist[item.key as ChecklistItemKey];
    const status = state?.status || '';

    // Status mapping & styling
    let statusLabel = 'NÃO TESTADO';
    let statusColor = '#64748b';
    let statusBg = '#0f172a';

    if (
      status === 'sim' ||
      status === 'funciona' ||
      status === 'sim_area' ||
      status === 'completo'
    ) {
      statusLabel = '✓ APROVADO / OK';
      statusColor = '#10b981';
      statusBg = '#064e3b';
    } else if (
      status === 'com_detalhes' ||
      status === 'com_dificuldade' ||
      status === 'mau_toque' ||
      status === 'parcial'
    ) {
      statusLabel = '⚠ COM DETALHES';
      statusColor = '#f59e0b';
      statusBg = '#78350f';
    } else if (
      status === 'nao' ||
      status === 'nao_funciona' ||
      status === 'nao_area' ||
      status === 'inoperante'
    ) {
      statusLabel = '✕ NÃO FUNCIONA';
      statusColor = '#ef4444';
      statusBg = '#7f1d1d';
    } else if (status === 'nao_possui' || status === 'sem_leitor') {
      statusLabel = '— NÃO POSSUI';
      statusColor = '#94a3b8';
      statusBg = '#1e293b';
    }

    // Row Container
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, colWidth, rowHeight - 10);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, colWidth, rowHeight - 10);

    // Item Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.title, x + 16, y + 26);

    // Subtitle / Note
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    const note = state?.observation || item.subtitle;
    const truncatedNote = note.length > 38 ? `${note.substring(0, 38)}...` : note;
    ctx.fillText(truncatedNote, x + 16, y + 43);

    // Status Pill
    const pillW = 160;
    const pillH = 32;
    const pillX = x + colWidth - pillW - 12;
    const pillY = y + 11;

    ctx.fillStyle = statusBg;
    ctx.fillRect(pillX, pillY, pillW, pillH);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(pillX, pillY, pillW, pillH);

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusLabel, pillX + pillW / 2, pillY + 21);
    ctx.textAlign = 'left';
  });

  // Footer
  const footerY = height - footerHeight + 25;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, footerY);
  ctx.lineTo(width - 50, footerY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('TechCheck Celular • Sistema de Diagnóstico de Hardware e Bancada', 50, footerY + 35);
  ctx.fillText('Relatório gerado digitalmente para conferência e arquivo', 50, footerY + 58);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('STATUS: DOCUMENTO FINALIZADO', width - 50, footerY + 45);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
