export type ReportStatus = 'MENUNGGU' | 'FAKTA' | 'HOAKS' | 'MISINFORMASI' | 'DITOLAK';

export type SocialPlatform = 'TikTok' | 'Instagram' | 'Twitter/X' | 'YouTube' | 'WhatsApp' | 'Facebook' | 'Lainnya';

export interface ReportItem {
  id: string;
  timestamp: string;
  reporterName: string;
  platform: SocialPlatform;
  claim: string;
  evidenceUrl: string;
  status: ReportStatus;
  medicalExplanation?: string;
  referenceUrl?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  aiSuggestedStatus?: 'FAKTA' | 'HOAKS' | 'MISINFORMASI';
  riskLevel?: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  category?: string;
}

export interface AIAnalysisResponse {
  status: 'FAKTA' | 'HOAKS' | 'MISINFORMASI';
  medicalExplanation: string;
  referenceUrl: string;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  keyPoints: string[];
  scientificSummary: string;
}

export interface GoogleSheetsConfig {
  appsScriptUrl: string;
  connected: boolean;
  lastSync: string | null;
  sheetName?: string;
}
