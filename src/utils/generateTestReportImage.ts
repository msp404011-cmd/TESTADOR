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
  deviceInfo?: { brand?: string; model?: string; color?: string; imei?: string }
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o canvas');

  const width = 1200;
  const items = CHECKLIST_ITEMS;
  const rowHeight = 64;
  const headerHeight = 320;
  const footerHeight = 140;
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

  // Inner Glow Line
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 28);
  ctx.lineTo(width - 32, 28);
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillText('LAUDO DE TESTE DO APARELHO', 50, 80);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('✓ CHECKLIST DE HARDWARE & SENSORES FINALIZADO', 50, 112);

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
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Data do Teste: ${dateStr} às ${timeStr}`, 50, 145);

  // Device Info bar if available
  const devTitle = [deviceInfo?.brand, deviceInfo?.model].filter(Boolean).join(' ') || 'Smartphone / Celular Testado';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Aparelho: ${devTitle}`, 50, 175);

  // Summary Metrics Badges
  const stats = calculateReportStats(checklist);
  const badgeY = 215;

  const badges = [
    { label: 'APROVADOS', value: `${stats.approved}`, color: '#10b981', bg: '#064e3b' },
    { label: 'C/ DETALHES', value: `${stats.details}`, color: '#f59e0b', bg: '#78350f' },
    { label: 'REPROVADOS', value: `${stats.failed}`, color: '#ef4444', bg: '#7f1d1d' },
    { label: 'NÃO POSSUI', value: `${stats.notApplicable}`, color: '#94a3b8', bg: '#1e293b' },
    { label: 'TOTAL TESTADOS', value: `${stats.total - stats.untested}/${stats.total}`, color: '#38bdf8', bg: '#0c4a6e' },
  ];

  let badgeX = 50;
  badges.forEach((b) => {
    const boxW = 200;
    const boxH = 65;

    // Rounded rect
    ctx.fillStyle = b.bg;
    roundRect(ctx, badgeX, badgeY, boxW, boxH, 12);
    ctx.fill();

    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, boxW, boxH, 12);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(b.label, badgeX + 16, badgeY + 25);

    ctx.fillStyle = b.color;
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(b.value, badgeX + 16, badgeY + 52);

    badgeX += boxW + 20;
  });

  // Divider Line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 305);
  ctx.lineTo(width - 50, 305);
  ctx.stroke();

  // Grid of Checklist items (2 columns)
  const startY = 330;
  const colWidth = (width - 120) / 2;

  items.forEach((item: ChecklistItemConfig, index: number) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 50 + col * (colWidth + 20);
    const y = startY + row * rowHeight;

    const state = checklist[item.key as ChecklistItemKey];
    let statusLabel = 'NÃO TESTADO';
    let statusColor = '#64748b';
    let statusBg = '#1e293b';

    if (state && state.status) {
      if (
        state.status === 'sim' ||
        state.status === 'funciona' ||
        state.status === 'sim_area' ||
        state.status === 'completo'
      ) {
        statusLabel = 'APROVADO (OK)';
        statusColor = '#10b981';
        statusBg = '#064e3b';
      } else if (
        state.status === 'com_detalhes' ||
        state.status === 'com_dificuldade' ||
        state.status === 'mau_toque' ||
        state.status === 'parcial'
      ) {
        statusLabel = 'C/ DETALHES';
        statusColor = '#f59e0b';
        statusBg = '#78350f';
      } else if (
        state.status === 'nao' ||
        state.status === 'nao_funciona' ||
        state.status === 'nao_area' ||
        state.status === 'inoperante'
      ) {
        statusLabel = 'NÃO FUNCIONA';
        statusColor = '#ef4444';
        statusBg = '#7f1d1d';
      } else if (state.status === 'nao_possui' || state.status === 'sem_leitor') {
        statusLabel = 'NÃO POSSUI';
        statusColor = '#94a3b8';
        statusBg = '#334155';
      }
    }

    // Row Card Background
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x, y, colWidth, 52, 8);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, colWidth, 52, 8);
    ctx.stroke();

    // Item Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${index + 1}. ${item.title}`, x + 14, y + 24);

    // Observation or subtitle
    ctx.fillStyle = state?.observation ? '#94a3b8' : '#475569';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    const obsText = state?.observation ? `Obs: ${state.observation}` : item.subtitle;
    const truncatedObs = obsText.length > 40 ? `${obsText.slice(0, 38)}...` : obsText;
    ctx.fillText(truncatedObs, x + 14, y + 42);

    // Status Badge on the right
    const badgeW = 120;
    const badgeH = 28;
    const badgePosX = x + colWidth - badgeW - 12;
    const badgePosY = y + 12;

    ctx.fillStyle = statusBg;
    roundRect(ctx, badgePosX, badgePosY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    roundRect(ctx, badgePosX, badgePosY, badgeW, badgeH, 6);
    ctx.stroke();

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusLabel, badgePosX + badgeW / 2, badgePosY + 18);
    ctx.textAlign = 'left'; // Reset
  });

  // Footer Section
  const footY = height - 95;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, footY);
  ctx.lineTo(width - 50, footY);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Comprovante emitido eletronicamente via TechCheck bancada técnica de testes.', 50, footY + 35);
  ctx.fillText('Validação física de hardware, periféricos, sensores e conectividade.', 50, footY + 55);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('TECHCHECK LAUDO OFICIAL', width - 50, footY + 45);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
