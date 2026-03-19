import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/src/components/ui/Button';
import { Sparkles, RefreshCw, Maximize2, Minimize2, BookOpen, GraduationCap, X, Check, Loader2, MessageSquarePlus } from 'lucide-react';
import { aiService } from '@/src/services/aiService';
import { useAppStore } from '@/src/store/useAppStore';

interface AIFloatingToolbarProps {
  editor: Editor;
  projectId: string;
}

export function AIFloatingToolbar({ editor, projectId }: AIFloatingToolbarProps) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId));
  const [isLoading, setIsLoading] = useState(false);
  const [diffText, setDiffText] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [showMarkPrompt, setShowMarkPrompt] = useState(false);
  const [markComment, setMarkComment] = useState('');

  if (!project) return null;

  const handleRewrite = async (instruction: string) => {
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) return;

    setIsLoading(true);
    setOriginalText(text);

    try {
      const context = `Тема: ${project.title}\nСпециальность: ${project.settings.specialty}`;
      const rewritten = await aiService.rewriteText(context, text, instruction);
      setDiffText(rewritten);
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkText = () => {
    if (!markComment.trim()) return;
    editor.chain().focus().setAIMark({ comment: markComment }).run();
    setShowMarkPrompt(false);
    setMarkComment('');
  };

  const acceptChanges = () => {
    if (diffText && originalText) {
      editor.chain().focus().insertContent(diffText).run();
    }
    setDiffText(null);
    setOriginalText(null);
    setShowCustomPrompt(false);
  };

  const rejectChanges = () => {
    setDiffText(null);
    setOriginalText(null);
    setShowCustomPrompt(false);
  };

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, placement: 'top-start' }} 
      shouldShow={({ editor, state }) => {
        if (diffText || showCustomPrompt || showMarkPrompt) return true;
        
        const { selection } = state;
        const { empty } = selection;
        
        // Don't show if selection is empty
        if (empty) return false;
        
        // Don't show if aiMark is active
        if (editor.isActive('aiMark')) return false;
        
        return true;
      }}
      className="flex flex-col gap-2"
    >
      {diffText ? (
        <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg p-4 w-96 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              Предложение ИИ
            </h3>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={rejectChanges} className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={acceptChanges} className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded border border-red-100 dark:border-red-900/30 line-through opacity-70">
              {originalText}
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded border border-emerald-100 dark:border-emerald-900/30">
              {diffText}
            </div>
          </div>
        </div>
      ) : showCustomPrompt ? (
        <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex gap-2 items-center">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Что изменить?"
            className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRewrite(customPrompt);
              } else if (e.key === 'Escape') {
                setShowCustomPrompt(false);
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={() => handleRewrite(customPrompt)} disabled={isLoading || !customPrompt.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowCustomPrompt(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : showMarkPrompt ? (
        <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex gap-2 items-center">
          <input
            type="text"
            value={markComment}
            onChange={(e) => setMarkComment(e.target.value)}
            placeholder="Комментарий для ИИ..."
            className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleMarkText();
              } else if (e.key === 'Escape') {
                setShowMarkPrompt(false);
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleMarkText} disabled={!markComment.trim()}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowMarkPrompt(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex gap-1 items-center">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1" onClick={() => handleRewrite('Перефразируй текст, сохранив смысл')} disabled={isLoading}>
            <RefreshCw className="h-3 w-3" /> Переписать
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1" onClick={() => handleRewrite('Расширь текст, добавь подробностей и примеров')} disabled={isLoading}>
            <Maximize2 className="h-3 w-3" /> Расширить
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1" onClick={() => handleRewrite('Сократи текст, оставь только главную суть')} disabled={isLoading}>
            <Minimize2 className="h-3 w-3" /> Сократить
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1" onClick={() => handleRewrite('Упрости текст, напиши более понятным языком')} disabled={isLoading}>
            <BookOpen className="h-3 w-3" /> Упростить
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1" onClick={() => handleRewrite('Сделай текст более научным, формальным и академичным')} disabled={isLoading}>
            <GraduationCap className="h-3 w-3" /> Научнее
          </Button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1 text-indigo-600 dark:text-indigo-400" onClick={() => setShowCustomPrompt(true)} disabled={isLoading}>
            <Sparkles className="h-3 w-3" /> Свой промпт
          </Button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex gap-1 text-amber-600 dark:text-amber-500" onClick={() => setShowMarkPrompt(true)} disabled={isLoading}>
            <MessageSquarePlus className="h-3 w-3" /> Пометить для ИИ
          </Button>
        </div>
      )}
    </BubbleMenu>
  );
}
