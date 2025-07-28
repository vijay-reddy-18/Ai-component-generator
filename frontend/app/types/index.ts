export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    theme: 'light' | 'dark';
    defaultModel: string;
    defaultLanguage: 'jsx' | 'tsx';
    autoSave: boolean;
  };
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  componentCode?: {
    jsx: string;
    tsx: string;
    css: string;
    preview: string;
  };
  metadata?: {
    model: string;
    language?: 'jsx' | 'tsx';
    tokens?: number;
    processingTime: number;
  };
}

export interface Session {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'active' | 'archived';
  isShared: boolean;
  shareId?: string;
  messages: Message[];
  currentComponent?: {
    jsx: string;
    tsx: string;
    css: string;
    preview: string;
    language: 'jsx' | 'tsx';
    version: number;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
  lastMessage?: string;
  hasCode?: boolean;
}

export interface ComponentCode {
  jsx: string;
  tsx: string;
  css: string;
  preview: string;
}

export interface AIResponse {
  response: string;
  componentCode: ComponentCode;
  metadata: {
    model: string;
    language: 'jsx' | 'tsx';
    processingTime: number;
    tokens?: number;
  };
}