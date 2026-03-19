import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useAppStore } from "../store/useAppStore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAISettings = () => {
  const state = useAppStore.getState();
  return state.aiSettings || {
    model: 'gemini-3-flash-preview',
    systemPrompt: 'Ты — профессиональный академический писатель. Пишешь дипломную работу на русском языке строго по ГОСТ 7.32-2017. Стиль: научный, формальный. Без воды, плагиата, канцеляризмов. Писать учитывая антиплагиат и анти ИИ.',
    temperature: 0.7
  };
};

export const aiService = {
  async generateSectionStream(
    context: string,
    prompt: string,
    onChunk: (text: string) => void
  ) {
    const settings = getAISettings();
    const response = await ai.models.generateContentStream({
      model: settings.model,
      contents: `Контекст проекта:\n${context}\n\nЗадание:\n${prompt}`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: settings.temperature,
      },
    });

    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  },

  async rewriteText(
    context: string,
    text: string,
    instruction: string
  ): Promise<string> {
    const settings = getAISettings();
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: `Контекст проекта:\n${context}\n\nИсходный текст:\n${text}\n\nЗадание:\n${instruction}\n\nВерни только измененный текст без дополнительных пояснений.`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: settings.temperature,
      },
    });
    return response.text || "";
  },

  async analyzeDocument(
    text: string,
    context: string,
    type: 'grammar' | 'style' | 'gost' | 'plagiarism' | 'all' = 'all'
  ): Promise<string> {
    const settings = getAISettings();
    let task = "Проверь документ на соответствие ГОСТу, логичность, связность, повторы, стилистические ошибки и полноту раздела. Выведи список замечаний с привязкой к тексту и предложениями по исправлению.";
    
    switch (type) {
      case 'grammar':
        task = "Проверь документ только на орфографические, пунктуационные и грамматические ошибки. Выведи список ошибок и варианты исправления.";
        break;
      case 'style':
        task = "Проверь документ на соответствие научному академическому стилю. Укажи на канцеляризмы, разговорные выражения, лишнюю воду и предложи более формальные формулировки.";
        break;
      case 'gost':
        task = "Проверь документ на соответствие ГОСТ 7.32-2017 (структура, оформление списков, ссылок, терминология). Укажи на отклонения.";
        break;
      case 'plagiarism':
        task = "Проанализируй текст на возможные заимствования и клише, которые могут снизить уникальность в системах Антиплагиат. Предложи способы перефразирования (рерайта) проблемных участков.";
        break;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Keep Pro for analysis as it's complex
      contents: `Контекст проекта:\n${context}\n\nТекст для анализа:\n${text}\n\nЗадание:\n${task}`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: settings.temperature,
      },
    });
    return response.text || "";
  },

  async chat(context: string, message: string, history: {role: string, text: string}[] = []): Promise<string> {
    const settings = getAISettings();
    // Only send the last 10 messages to save tokens and keep context relevant
    const recentHistory = history.slice(-10);
    const historyText = recentHistory.map(h => `${h.role === 'user' ? 'Пользователь' : 'ИИ'}: ${h.text}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: `Контекст проекта:\n${context}\n\nИстория чата (последние сообщения):\n${historyText}\n\nПользователь: ${message}\n\nОтвет ИИ:`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: settings.temperature,
      },
    });
    return response.text || "";
  },
  
  async suggestContinuation(context: string, textBefore: string): Promise<string> {
    const settings = getAISettings();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Always use flash for fast inline suggestions
      contents: `Контекст проекта:\n${context}\n\nПродолжи следующий текст (только продолжение, без повторения исходного текста, максимум 1-2 предложения):\n${textBefore}`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: 0.3, // Lower temp for more deterministic continuation
      },
    });
    return response.text?.trim() || "";
  },

  async generateLiterature(context: string, topic: string): Promise<string> {
    const settings = getAISettings();
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: `Контекст проекта:\n${context}\n\nТема:\n${topic}\n\nЗадание:\nСгенерируй список литературы по теме (книги, статьи, ГОСТы). Автоформатирование по ГОСТ Р 7.0.5-2008. Предупреди пользователя, что источники могут быть выдуманы и их нужно проверить.`,
      config: {
        systemInstruction: settings.systemPrompt,
        temperature: settings.temperature,
      },
    });
    return response.text || "";
  }
};
