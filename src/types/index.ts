export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

export type SectionStatus = 'empty' | 'draft' | 'ready' | 'needs_revision';

export type FileType = 'instruction' | 'material' | 'draft';

export interface GostSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: { top: number; right: number; bottom: number; left: number };
  linkStyle: string;
  pageNumbering: boolean;
}

export interface ProjectSettings {
  theme: string;
  type: 'bachelor' | 'master' | 'specialist';
  university: string;
  department: string;
  specialty: string;
  advisor: string;
  year: number;
  gost: GostSettings;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  status: SectionStatus;
  order: number;
  children: DocumentSection[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  content: string; // Base64 or text for simplicity in this demo
  includedInAI: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  settings: ProjectSettings;
  sections: DocumentSection[];
  files: ProjectFile[];
  chatHistory: ChatMessage[];
  tokensUsed: number;
}
