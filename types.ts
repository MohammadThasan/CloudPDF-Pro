import { LucideIcon } from 'lucide-react';

export enum ToolCategory {
  CONVERT_TO_PDF = 'Convert to PDF',
  CONVERT_FROM_PDF = 'Convert from PDF',
  UTILITIES = 'PDF Utilities',
  SECURITY = 'Security',
}

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  isPro?: boolean;
  path: string;
  accepts: string; // e.g., ".pdf, .docx"
  outputType: string; // e.g., "application/pdf"
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  READY = 'READY', // File selected, showing settings
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface OutputSettings {
  orientation: 'portrait' | 'landscape';
  rotation: 0 | 90 | 180 | 270;
  addBorder: boolean;
  imageQuality?: 'low' | 'medium' | 'high';
}

export interface ProcessedFile {
  name: string;
  size: number;
  url: string; // Blob URL
  type: string;
  originalName: string;
  textContent?: string; // For OCR results
}