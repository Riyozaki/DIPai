import { useAppStore } from "@/src/store/useAppStore"
import { Activity, FileText, Hash, CheckCircle } from "lucide-react"

export function StatusBar({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))
  const activeSectionId = useAppStore((state) => state.activeSectionId)

  if (!project) return null

  const calculateStats = (sections: any[]) => {
    let words = 0
    let chars = 0
    let charsNoSpaces = 0

    const count = (sec: any) => {
      const text = sec.content || ''
      words += text.split(/\s+/).filter((w: string) => w.length > 0).length
      chars += text.length
      charsNoSpaces += text.replace(/\s/g, '').length
      sec.children.forEach(count)
    }
    sections.forEach(count)
    return { words, chars, charsNoSpaces }
  }

  const stats = calculateStats(project.sections)
  const pages = Math.ceil(stats.chars / 1800) || 1 // Approximate 1800 chars per page

  return (
    <footer className="flex h-8 items-center justify-between border-t border-slate-200 bg-slate-50 px-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
      <div className="flex items-center space-x-4">
        <div className="flex items-center" title="Страниц">
          <FileText className="mr-1.5 h-3.5 w-3.5" /> {pages} стр.
        </div>
        <div className="flex items-center" title="Слов">
          <Hash className="mr-1.5 h-3.5 w-3.5" /> {stats.words} слов
        </div>
        <div className="flex items-center" title="Знаков (с пробелами)">
          <span className="mr-1.5 font-mono">C</span> {stats.chars} зн.
        </div>
        <div className="flex items-center" title="Знаков (без пробелов)">
          <span className="mr-1.5 font-mono">c</span> {stats.charsNoSpaces} зн. б/п
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center text-emerald-600 dark:text-emerald-500" title="Оригинальность">
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 85% ориг.
        </div>
        <div className="flex items-center text-indigo-600 dark:text-indigo-400" title="ИИ-активность">
          <Activity className="mr-1.5 h-3.5 w-3.5" /> ИИ готов
        </div>
      </div>
    </footer>
  )
}
