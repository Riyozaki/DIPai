import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Project, DocumentSection, ProjectFile, ProjectSettings, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  activeSectionId: string | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  aiSettings: {
    model: string;
    systemPrompt: string;
    temperature: number;
  };
  updateAISettings: (settings: Partial<AppState['aiSettings']>) => void;
  createProject: (title: string, settings: Omit<ProjectSettings, 'gost'>) => string;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  setActiveSection: (id: string | null) => void;
  updateSectionContent: (projectId: string, sectionId: string, content: string) => void;
  updateSectionStatus: (projectId: string, sectionId: string, status: DocumentSection['status']) => void;
  addFile: (projectId: string, file: Omit<ProjectFile, 'id' | 'createdAt'>) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  toggleFileAI: (projectId: string, fileId: string) => void;
  reorderSections: (projectId: string, sections: DocumentSection[]) => void;
  addChatMessage: (projectId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addTokens: (projectId: string, amount: number) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
}

const defaultGost = {
  fontFamily: 'Times New Roman',
  fontSize: 14,
  lineHeight: 1.5,
  margins: { top: 2, right: 1, bottom: 2, left: 3 },
  linkStyle: 'GOST R 7.0.5-2008',
  pageNumbering: true,
};

const defaultSections: DocumentSection[] = [
  { id: uuidv4(), title: 'Титульный лист', content: '<h1 style="text-align: center;">ТИТУЛЬНЫЙ ЛИСТ</h1><p style="text-align: center;">(Заполняется по форме учебного заведения)</p>', status: 'empty', order: 0, children: [] },
  { id: uuidv4(), title: 'Содержание', content: '<h1 style="text-align: center;">СОДЕРЖАНИЕ</h1><p>Оглавление будет сгенерировано автоматически.</p>', status: 'empty', order: 1, children: [] },
  { id: uuidv4(), title: 'Введение', content: '<h1 style="text-align: center;">ВВЕДЕНИЕ</h1><p style="text-indent: 1.25cm;"><strong>Актуальность темы исследования.</strong> [Опишите актуальность]</p><p style="text-indent: 1.25cm;"><strong>Цель исследования:</strong> [Укажите цель]</p><p style="text-indent: 1.25cm;"><strong>Задачи исследования:</strong></p><ul><li>[Задача 1]</li><li>[Задача 2]</li></ul><p style="text-indent: 1.25cm;"><strong>Объект исследования:</strong> [Объект]</p><p style="text-indent: 1.25cm;"><strong>Предмет исследования:</strong> [Предмет]</p><p style="text-indent: 1.25cm;"><strong>Методы исследования:</strong> [Методы]</p>', status: 'empty', order: 2, children: [] },
  { id: uuidv4(), title: 'Глава 1', content: '<h1 style="text-align: center;">1 ТЕОРЕТИЧЕСКИЕ ОСНОВЫ...</h1><p style="text-indent: 1.25cm;">Вводный текст к первой главе.</p>', status: 'empty', order: 3, children: [
    { id: uuidv4(), title: '1.1', content: '<h2>1.1 Название первого параграфа</h2><p style="text-indent: 1.25cm;">Текст параграфа.</p>', status: 'empty', order: 0, children: [] },
    { id: uuidv4(), title: '1.2', content: '<h2>1.2 Название второго параграфа</h2><p style="text-indent: 1.25cm;">Текст параграфа.</p>', status: 'empty', order: 1, children: [] },
  ] },
  { id: uuidv4(), title: 'Глава 2', content: '<h1 style="text-align: center;">2 ПРАКТИЧЕСКАЯ ЧАСТЬ...</h1><p style="text-indent: 1.25cm;">Вводный текст ко второй главе.</p>', status: 'empty', order: 4, children: [
    { id: uuidv4(), title: '2.1', content: '<h2>2.1 Название первого параграфа</h2><p style="text-indent: 1.25cm;">Текст параграфа.</p>', status: 'empty', order: 0, children: [] },
    { id: uuidv4(), title: '2.2', content: '<h2>2.2 Название второго параграфа</h2><p style="text-indent: 1.25cm;">Текст параграфа.</p>', status: 'empty', order: 1, children: [] },
  ] },
  { id: uuidv4(), title: 'Заключение', content: '<h1 style="text-align: center;">ЗАКЛЮЧЕНИЕ</h1><p style="text-indent: 1.25cm;">В ходе выполнения работы были получены следующие результаты...</p>', status: 'empty', order: 5, children: [] },
  { id: uuidv4(), title: 'Список литературы', content: '<h1 style="text-align: center;">СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ</h1><ol><li>Иванов И.И. Название книги. — М.: Издательство, 2023. — 300 с.</li></ol>', status: 'empty', order: 6, children: [] },
  { id: uuidv4(), title: 'Приложения', content: '<h1 style="text-align: center;">ПРИЛОЖЕНИЕ А</h1><p style="text-align: center;">(обязательное)</p><h2 style="text-align: center;">Название приложения</h2>', status: 'empty', order: 7, children: [] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeSectionId: null,
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      aiSettings: {
        model: 'gemini-3-flash-preview',
        systemPrompt: 'Ты — профессиональный академический писатель. Пишешь дипломную работу на русском языке строго по ГОСТ 7.32-2017. Стиль: научный, формальный. Без воды, плагиата, канцеляризмов. Писать учитывая антиплагиат и анти ИИ.',
        temperature: 0.7,
      },
      updateAISettings: (settings) => set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } })),
      createProject: (title, settings) => {
        const newProject: Project = {
          id: uuidv4(),
          title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'draft',
          settings: { ...settings, gost: defaultGost },
          sections: JSON.parse(JSON.stringify(defaultSections)), // Deep copy
          files: [],
          chatHistory: [],
          tokensUsed: 0,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject.id;
      },
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      duplicateProject: (id) => set((state) => {
        const project = state.projects.find((p) => p.id === id);
        if (!project) return state;
        const newProject = { ...project, id: uuidv4(), title: `${project.title} (Копия)`, createdAt: Date.now(), updatedAt: Date.now() };
        return { projects: [...state.projects, newProject] };
      }),
      setActiveProject: (id) => set({ activeProjectId: id, activeSectionId: null }),
      setActiveSection: (id) => set({ activeSectionId: id }),
      updateSectionContent: (projectId, sectionId, content) => set((state) => {
        const updateSections = (sections: DocumentSection[]): DocumentSection[] => {
          return sections.map(sec => {
            if (sec.id === sectionId) {
              return { ...sec, content, status: content.trim() ? 'draft' : 'empty' };
            }
            if (sec.children.length > 0) {
              return { ...sec, children: updateSections(sec.children) };
            }
            return sec;
          });
        };
        return {
          projects: state.projects.map(p => p.id === projectId ? { ...p, updatedAt: Date.now(), sections: updateSections(p.sections) } : p)
        };
      }),
      updateSectionStatus: (projectId, sectionId, status) => set((state) => {
        const updateSections = (sections: DocumentSection[]): DocumentSection[] => {
          return sections.map(sec => {
            if (sec.id === sectionId) return { ...sec, status };
            if (sec.children.length > 0) return { ...sec, children: updateSections(sec.children) };
            return sec;
          });
        };
        return {
          projects: state.projects.map(p => p.id === projectId ? { ...p, updatedAt: Date.now(), sections: updateSections(p.sections) } : p)
        };
      }),
      addFile: (projectId, file) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p, updatedAt: Date.now(), files: [...p.files, { ...file, id: uuidv4(), createdAt: Date.now() }]
        } : p)
      })),
      deleteFile: (projectId, fileId) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p, updatedAt: Date.now(), files: p.files.filter(f => f.id !== fileId)
        } : p)
      })),
      toggleFileAI: (projectId, fileId) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p, updatedAt: Date.now(), files: p.files.map(f => f.id === fileId ? { ...f, includedInAI: !f.includedInAI } : f)
        } : p)
      })),
      reorderSections: (projectId, sections) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, updatedAt: Date.now(), sections } : p)
      })),
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      addChatMessage: (projectId, message) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p,
          chatHistory: [...(p.chatHistory || []), { ...message, id: uuidv4(), timestamp: Date.now() }]
        } : p)
      })),
      addTokens: (projectId, amount) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p,
          tokensUsed: (p.tokensUsed || 0) + amount
        } : p)
      })),
    }),
    {
      name: 'diploma-ai-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
