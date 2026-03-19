import { useAppStore } from "@/src/store/useAppStore"
import { Button } from "@/src/components/ui/Button"
import { Save, Download, Upload, Settings, Wand2, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Toolbar({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))
  const activeSectionId = useAppStore((state) => state.activeSectionId)
  const navigate = useNavigate()

  if (!project) return null

  const findSectionPath = (sections: any[], targetId: string, path: string[] = []): string[] | null => {
    for (const section of sections) {
      if (section.id === targetId) return [...path, section.title]
      if (section.children.length > 0) {
        const found = findSectionPath(section.children, targetId, [...path, section.title])
        if (found) return found
      }
    }
    return null
  }

  const breadcrumbs = activeSectionId ? findSectionPath(project.sections, activeSectionId) || [] : []

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-900 dark:text-slate-50 cursor-pointer hover:underline" onClick={() => navigate('/')}>
          {project.title}
        </span>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="mx-1 h-4 w-4" />
            <span className={index === breadcrumbs.length - 1 ? "font-semibold text-slate-900 dark:text-slate-50" : ""}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <span className="mr-4 text-xs text-slate-500 dark:text-slate-400">
          Сохранено
        </span>
        <Button variant="outline" size="sm" className="h-8">
          <Save className="mr-2 h-3.5 w-3.5" /> Сохранить
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <Download className="mr-2 h-3.5 w-3.5" /> Экспорт
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <Upload className="mr-2 h-3.5 w-3.5" /> Импорт
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => document.dispatchEvent(new CustomEvent('open-document-check'))}>
          <Wand2 className="mr-2 h-3.5 w-3.5" /> Проверить документ
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white border-none" onClick={() => useAppStore.getState().toggleChat()}>
          <Wand2 className="mr-2 h-3.5 w-3.5" /> ИИ-ассистент
        </Button>
      </div>
    </header>
  )
}
