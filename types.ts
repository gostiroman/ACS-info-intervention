export enum Stage {
  HEALTHY = 'HEALTHY',
  ATHEROSCLEROSIS = 'ATHEROSCLEROSIS',
  RUPTURE_THROMBOSIS = 'RUPTURE_THROMBOSIS', // MI happens here
  NECROSIS = 'NECROSIS', // New stage: Tissue death
  GUIDEWIRE = 'GUIDEWIRE',
  BALLOON = 'BALLOON',
  STENT_DEPLOY = 'STENT_DEPLOY',
  RESTORED = 'RESTORED'
}

export interface StageInfo {
  id: Stage;
  title: string;
  description: string;
  medicalContext: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}