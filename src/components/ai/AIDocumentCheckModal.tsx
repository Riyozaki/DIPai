import * as React from "react"
import { useState, useEffect } from "react"
import { Modal } from "@/src/components/ui/Modal"
import { Button } from "@/src/components/ui/Button"
import { useAppStore } from "@/src/store/useAppStore"
import { aiService } from "@/src/services/aiService"
import { Loader2, CheckCircle, AlertTriangle, Info, Sparkles } from "lucide-react"
import Markdown from "react-markdown"

export function AIDocumentCheckModal({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [checkType, setCheckType] = useState<'grammar' | 'style' | 'gost' | 'plagiarism' | 'all'>('all')
  const [estimatedTokens, setEstimatedTokens] = useState(0)
  
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))

  useEffect(() => {
    if (!project) return;
    
    let fullContent = ''
    const traverse = (sections: any[]) => {
      for (const section of sections) {
        if (section.content) {
          fullContent += `\n\n--- Раздел: ${section.title} ---\n\n${section.content}`
        }
        traverse(section.children)
      }
    }
    traverse(project.sections)

    const projectContext = `Тема: ${project.title}\nСпециальность: ${project.settings.specialty}`
    const inputTokens = Math.ceil((fullContent.length + projectContext.length) / 4)
    const outputTokens = 1000 // Rough estimate for analysis output
    
    setEstimatedTokens(inputTokens + outputTokens)
  }, [project, checkType])

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    document.addEventListener('open-document-check', handleOpen)
    return () => document.removeEventListener('open-document-check', handleOpen)
  }, [])

  const handleAnalyze = async () => {
    if (!project) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      // Gather all content
      let fullContent = ''
      const traverse = (sections: any[]) => {
        for (const section of sections) {
          if (section.content) {
            fullContent += `\n\n--- Раздел: ${section.title} ---\n\n${section.content}`
          }
          traverse(section.children)
        }
      }
      traverse(project.sections)

      const projectContext = `Тема: ${project.title}\nСпециальность: ${project.settings.specialty}`

      const result = await aiService.analyzeDocument(fullContent, projectContext, checkType)
      setAnalysisResult(result)
      
      // Update tokens
      const estimatedTokens = Math.ceil((fullContent.length + result.length) / 4)
      useAppStore.getState().addTokens(projectId, estimatedTokens)
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisResult("Произошла ошибка при анализе документа. Пожалуйста, попробуйте еще раз.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isAnalyzing && setIsOpen(false)}
      title="Проверка документа ИИ"
      className="sm:max-w-[700px]"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={checkType === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCheckType('all')}
          >
            Полная проверка
          </Button>
          <Button 
            variant={checkType === 'grammar' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCheckType('grammar')}
          >
            Орфография и пунктуация
          </Button>
          <Button 
            variant={checkType === 'style' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCheckType('style')}
          >
            Научный стиль
          </Button>
          <Button 
            variant={checkType === 'gost' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCheckType('gost')}
          >
            Соответствие ГОСТ
          </Button>
        </div>

        {!analysisResult && !isAnalyzing && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Info className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p>Выберите тип проверки и нажмите "Начать анализ".</p>
            <p className="text-sm mt-2">ИИ проанализирует весь текст вашего проекта.</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-slate-600 dark:text-slate-300">Анализируем документ...</p>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
            <Markdown>{analysisResult}</Markdown>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 w-full">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          {!analysisResult && !isAnalyzing && (
            <>
              <Sparkles className="h-3 w-3" />
              ~{estimatedTokens.toLocaleString()} токенов
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Закрыть
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Анализ...
              </>
            ) : (
              'Начать анализ'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
