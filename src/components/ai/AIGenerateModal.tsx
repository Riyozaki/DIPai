import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useAppStore } from '@/src/store/useAppStore';
import { aiService } from '@/src/services/aiService';
import { Loader2, Sparkles, StopCircle, Check } from 'lucide-react';

interface AIGenerateModalProps {
  projectId: string;
  sectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (content: string) => void;
}

export function AIGenerateModal({ projectId, sectionId, isOpen, onClose, onGenerated }: AIGenerateModalProps) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId));
  const [pages, setPages] = useState('1');
  const [style, setStyle] = useState('строго научный');
  const [depth, setDepth] = useState('стандартно');
  const [instructions, setInstructions] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  if (!project) return null;

  React.useEffect(() => {
    const selectedMaterials = project.files
      .filter(f => selectedFiles.includes(f.id))
      .map(f => `[${f.name}]: ${f.content}`)
      .join('\n\n');

    const context = `Тема: ${project.title}\nСпециальность: ${project.settings.specialty}\nМатериалы для использования:\n${selectedMaterials}`;
    const prompt = `Напиши раздел дипломной работы.\nОбъем: примерно ${pages} страниц.\nСтиль: ${style}.\nГлубина проработки: ${depth}.\nДополнительные указания: ${instructions}\n\nВерни только текст раздела, отформатированный в HTML (используй теги <p>, <h2>, <ul>, <ol>). Не добавляй заголовок раздела, если он не требуется по смыслу.`;
    
    // Rough estimation: 1 token ≈ 4 characters
    // Add expected output tokens (roughly 500 tokens per page)
    const inputTokens = Math.ceil((context.length + prompt.length) / 4);
    const outputTokens = Math.ceil(parseFloat(pages) * 500);
    
    setEstimatedTokens(inputTokens + outputTokens);
  }, [pages, style, depth, instructions, selectedFiles, project]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent('');
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const selectedMaterials = project.files
        .filter(f => selectedFiles.includes(f.id))
        .map(f => `[${f.name}]: ${f.content}`)
        .join('\n\n');

      const context = `Тема: ${project.title}
Специальность: ${project.settings.specialty}
Материалы для использования:
${selectedMaterials}`;

      const prompt = `Напиши раздел дипломной работы.
Объем: примерно ${pages} страниц.
Стиль: ${style}.
Глубина проработки: ${depth}.
Дополнительные указания: ${instructions}

Верни только текст раздела, отформатированный в HTML (используй теги <p>, <h2>, <ul>, <ol>). Не добавляй заголовок раздела, если он не требуется по смыслу.`;

      let fullContent = '';
      await aiService.generateSectionStream(context, prompt, (chunk) => {
        if (controller.signal.aborted) return;
        fullContent += chunk;
        setGeneratedContent(fullContent);
      });

      if (!controller.signal.aborted) {
        onGenerated(fullContent);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        console.error('Generation failed:', error);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isGenerating && onClose()} 
      title="Сгенерировать раздел с ИИ"
      className="sm:max-w-[600px]"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <p className="text-sm text-slate-500 mb-4">
          Настройте параметры генерации. ИИ учтет контекст вашего проекта и выбранные материалы.
        </p>

        {!isGenerating && !generatedContent ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Примерный объем (страниц)</label>
                <select 
                  value={pages} 
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="0.5">0.5 страницы</option>
                  <option value="1">1 страница</option>
                  <option value="2">2 страницы</option>
                  <option value="3">3 страницы</option>
                  <option value="5">5 страниц</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Стиль изложения</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="строго научный">Строго научный</option>
                  <option value="умеренно научный">Умеренно научный</option>
                  <option value="научно-популярный">Научно-популярный</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Глубина проработки</label>
              <select 
                value={depth} 
                onChange={(e) => setDepth(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="поверхностно">Поверхностно (обзорно)</option>
                <option value="стандартно">Стандартно</option>
                <option value="углубленно">Углубленно (с детальным анализом)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дополнительные указания</label>
              <textarea
                placeholder="О чем именно нужно написать в этом разделе? Какие аспекты подчеркнуть?"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {project.files.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Использовать материалы</label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 space-y-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                  {project.files.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`file-${file.id}`}
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles([...selectedFiles, file.id]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`file-${file.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {file.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 min-h-[200px] max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert">
              {generatedContent ? (
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  Подготовка к генерации...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        {!isGenerating && !generatedContent ? (
          <>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              ~{estimatedTokens.toLocaleString()} токенов
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Отмена</Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Сгенерировать
              </Button>
            </div>
          </>
        ) : isGenerating ? (
          <div className="flex justify-end w-full">
            <Button variant="destructive" onClick={stopGeneration} className="gap-2">
              <StopCircle className="h-4 w-4" />
              Остановить
            </Button>
          </div>
        ) : (
          <div className="flex justify-end w-full gap-2">
            <Button variant="outline" onClick={() => { setGeneratedContent(''); setIsGenerating(false); }}>Переделать</Button>
            <Button onClick={() => { onGenerated(generatedContent); onClose(); }} className="gap-2">
              <Check className="h-4 w-4" />
              Принять
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
