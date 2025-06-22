export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  remainingQueries?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  sources?: LegalSource[];
  isTyping?: boolean;
}

export interface LegalSource {
  title: string;
  article: string;
  code: string;
  url?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface LegalTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  premium: boolean;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface LegalArticle {
  id: string;
  title: string;
  code: string;
  article: string;
  content: string;
  lastUpdated: Date;
}