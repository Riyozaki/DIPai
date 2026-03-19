import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/src/store/useAppStore';
import { aiService } from '@/src/services/aiService';
import { X, Send, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';

export function AIChatSidebar({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId));
  const isChatOpen = useAppStore((state) => state.isChatOpen);
  const toggleChat = useAppStore((state) => state.toggleChat);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const addTokens = useAppStore((state) => state.addTokens);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  const chatHistory = project?.chatHistory || [];

  useEffect(() => {
    if (!project) return;
    const contextLength = project.title.length + project.settings.specialty.length + project.settings.type.length + project.settings.university.length;
    const filesLength = project.files.filter(f => f.includedInAI).reduce((acc, f) => acc + Math.min(f.content.length, 500), 0);
    const recentHistory = chatHistory.slice(-10);
    const historyLength = recentHistory.reduce((acc, msg) => acc + msg.text.length, 0);
    
    // Rough estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil((contextLength + filesLength + historyLength + input.length) / 4);
    setEstimatedTokens(inputTokens);
  }, [input, project, chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  if (!isChatOpen || !project) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage(projectId, { role: 'user', text: userMessage });
    setIsLoading(true);

    try {
      // Build context
      const context = `Тема: ${project.title}
Специальность: ${project.settings.specialty}
Тип работы: ${project.settings.type}
ВУЗ: ${project.settings.university}

Материалы:
${project.files.filter(f => f.includedInAI).map(f => `[${f.name}]: ${f.content.substring(0, 500)}...`).join('\n')}
`;

      const response = await aiService.chat(context, userMessage, chatHistory);
      
      addChatMessage(projectId, { role: 'ai', text: response });
      // Estimate tokens: roughly 4 chars per token
      addTokens(projectId, Math.ceil((userMessage.length + response.length) / 4));
    } catch (error) {
      console.error('Failed to send message:', error);
      addChatMessage(projectId, { role: 'ai', text: 'Произошла ошибка при обращении к ИИ. Пожалуйста, попробуйте позже.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full shadow-xl z-20">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-semibold">ИИ Ассистент</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
            <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>Задайте мне любой вопрос по вашей дипломной работе.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput('Предложи структуру для Введения')} className="text-xs justify-start">
                Предложи структуру для Введения
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Подбери 5 источников по теме')} className="text-xs justify-start">
                Подбери 5 источников по теме
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Сформулируй цель и задачи')} className="text-xs justify-start">
                Сформулируй цель и задачи
              </Button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[90%] rounded-lg p-3 text-sm",
                msg.role === 'user' 
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 self-end ml-auto rounded-tr-none" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-none group"
              )}
            >
              {msg.role === 'ai' && (
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI</span>
                  <button 
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="Копировать"
                  >
                    {copiedId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-lg rounded-tl-none p-3 max-w-[80%] flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span className="text-sm text-slate-500">Думает...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите ИИ..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white min-h-[80px] pr-10 resize-none"
          />
          <Button 
            size="icon" 
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-400">Enter для отправки, Shift+Enter для переноса</span>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 flex items-center gap-1" title="Примерная стоимость запроса">
              <Sparkles className="h-3 w-3" />
              ~{estimatedTokens.toLocaleString()} токенов
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1" title="Всего потрачено">
              Всего: {(project.tokensUsed || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
