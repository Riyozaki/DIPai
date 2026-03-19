import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/src/components/ui/Button';
import { Sparkles, X, Check, Loader2, Trash2 } from 'lucide-react';
import { aiService } from '@/src/services/aiService';
import { useAppStore } from '@/src/store/useAppStore';

interface AIMarkToolbarProps {
  editor: Editor;
  projectId: string;
}

export function AIMarkToolbar({ editor, projectId }: AIMarkToolbarProps) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId));
  const [isLoading, setIsLoading] = useState(false);
  const [diffText, setDiffText] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  useEffect(() => {
    const updateComment = () => {
      if (editor.isActive('aiMark')) {
        const attrs = editor.getAttributes('aiMark');
        setComment(attrs.comment);
      } else {
        setComment(null);
      }
    };

    editor.on('selectionUpdate', updateComment);
    editor.on('transaction', updateComment);

    return () => {
      editor.off('selectionUpdate', updateComment);
      editor.off('transaction', updateComment);
    };
  }, [editor]);

  if (!project || !comment) return null;

  const handleProcess = async () => {
    const selection = editor.state.selection;
    // We need to find the extent of the mark
    let from = selection.from;
    let to = selection.to;
    
    // If selection is empty, try to expand to the mark boundaries
    if (selection.empty) {
      const $pos = editor.state.doc.resolve(selection.from);
      const mark = $pos.marks().find(m => m.type.name === 'aiMark');
      if (mark) {
        // Find mark start and end
        let start = $pos.pos;
        let end = $pos.pos;
        while (start > 0 && editor.state.doc.resolve(start - 1).marks().includes(mark)) start--;
        while (end < editor.state.doc.content.size && editor.state.doc.resolve(end + 1).marks().includes(mark)) end++;
        from = start;
        to = end;
      }
    }

    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    setIsLoading(true);
    setOriginalText(text);

    try {
      const context = `Тема: ${project.title}\nСпециальность: ${project.settings.specialty}`;
      const rewritten = await aiService.rewriteText(context, text, comment);
      setDiffText(rewritten);
    } catch (error) {
      console.error('Process mark failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptChanges = () => {
    if (diffText && originalText) {
      // Find the mark boundaries again to replace
      const selection = editor.state.selection;
      let from = selection.from;
      let to = selection.to;
      
      if (selection.empty) {
        const $pos = editor.state.doc.resolve(selection.from);
        const mark = $pos.marks().find(m => m.type.name === 'aiMark');
        if (mark) {
          let start = $pos.pos;
          let end = $pos.pos;
          while (start > 0 && editor.state.doc.resolve(start - 1).marks().includes(mark)) start--;
          while (end < editor.state.doc.content.size && editor.state.doc.resolve(end + 1).marks().includes(mark)) end++;
          from = start;
          to = end;
        }
      }

      editor.chain().focus().deleteRange({ from, to }).insertContent(diffText).run();
    }
    setDiffText(null);
    setOriginalText(null);
  };

  const rejectChanges = () => {
    setDiffText(null);
    setOriginalText(null);
  };

  const removeMark = () => {
    editor.chain().focus().unsetAIMark().run();
  };

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, placement: 'bottom-start' }} 
      shouldShow={({ editor }) => editor.isActive('aiMark')}
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
      ) : (
        <div className="bg-white dark:bg-slate-900 shadow-xl border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3 w-80 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-xs font-semibold flex items-center gap-1.5 text-amber-600 dark:text-amber-500 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                Пометка для ИИ
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{comment}"</p>
            </div>
            <Button size="icon" variant="ghost" onClick={removeMark} className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleProcess} 
            disabled={isLoading}
            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-200 border-none"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Обработка...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Выполнить</>
            )}
          </Button>
        </div>
      )}
    </BubbleMenu>
  );
}
