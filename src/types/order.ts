export type ChecklistItemKey =
  | 'power_button'
  | 'touch_screen'
  | 'flash'
  | 'wifi'
  | 'front_camera'
  | 'rear_camera'
  | 'microphone'
  | 'audio'
  | 'volume_up'
  | 'volume_down'
  | 'biometrics'
  | 'aux_button'
  | 'chip_tray'
  | 'sd_card'
  | 'chip_1'
  | 'chip_2'
  | 'signal_area';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface ChecklistOption {
  id: string;
  label: string;
  shortLabel?: string;
  tone: StatusTone;
  description?: string;
}

export interface ChecklistItemConfig {
  key: ChecklistItemKey;
  title: string;
  subtitle: string;
  iconName: string;
  options: ChecklistOption[];
  hasPresenceToggle?: boolean; // For Biometrics and Aux Button (Tem / Não Tem)
  presenceLabel?: string;
  quickNotes: string[];
  testType?:
    | 'touch'
    | 'flash'
    | 'camera_front'
    | 'camera_rear'
    | 'microphone'
    | 'speaker'
    | 'vibration'
    | 'screen_pixels'
    | 'volume'
    | 'wifi'
    | 'biometrics'
    | 'sd_card'
    | 'sim_manager'
    | 'signal_area';
}

export interface ChecklistItemState {
  hasItem?: boolean; // For "Tem / Não Tem" items
  status: string; // ID of selected option
  observation: string;
}

export type ChecklistRecord = Record<ChecklistItemKey, ChecklistItemState>;

export interface DeviceInfo {
  brand: string;
  model: string;
  color: string;
  imei: string;
  serialNumber: string;
  lockType: 'none' | 'pin' | 'password' | 'pattern';
  lockPassword: string;
  patternNodes?: number[]; // indices 0-8 for 3x3 unlock pattern
  accessories: {
    charger: boolean;
    cable: boolean;
    case: boolean;
    screenProtector: boolean;
    simCardLeft: boolean;
    memoryCardLeft: boolean;
    other: string;
  };
  physicalCondition: {
    screenCracked: boolean;
    scratches: boolean;
    dents: boolean;
    backCoverBroken: boolean;
    missingScrews: boolean;
    bentHousing: boolean;
    waterDamageIndication: boolean;
    notes: string;
  };
}

export interface CustomerInfo {
  name: string;
  phone: string;
  document: string; // CPF
  email: string;
}

export interface ServiceBudget {
  technicianName: string;
  reportedDefect: string;
  technicalDiagnosis: string;
  servicesCost: number;
  partsCost: number;
  discount: number;
  totalCost: number;
  warrantyDays: number;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  checklistType: 'entry' | 'exit'; // Entrada ou Saída
  status: 'draft' | 'in_analysis' | 'approved' | 'in_repair' | 'ready' | 'delivered';
  customer: CustomerInfo;
  device: DeviceInfo;
  checklist: ChecklistRecord;
  budget: ServiceBudget;
  technicianSignature?: string;
  customerSignature?: string;
}
