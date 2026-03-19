import { useAppStore } from "@/src/store/useAppStore"
import { DocumentSection } from "@/src/types"
import { ChevronRight, ChevronDown, FileText, Circle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/src/lib/utils"

export function StructureTree({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))
  const activeSectionId = useAppStore((state) => state.activeSectionId)
  const setActiveSection = useAppStore((state) => state.setActiveSection)

  if (!project) return null

  const renderSection = (section: DocumentSection, level: number = 0) => {
    const hasChildren = section.children && section.children.length > 0
    const [expanded, setExpanded] = useState(true)
    const isActive = activeSectionId === section.id

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'empty': return 'text-slate-300 dark:text-slate-600'
        case 'draft': return 'text-yellow-500'
        case 'ready': return 'text-emerald-500'
        case 'needs_revision': return 'text-red-500'
        default: return 'text-slate-300'
      }
    }

    return (
      <div key={section.id} className="select-none">
        <div
          className={cn(
            "group flex cursor-pointer items-center rounded-md py-1.5 pr-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50",
            isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setActiveSection(section.id)}
        >
          <div className="flex w-4 items-center justify-center mr-1" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
            {hasChildren ? (
              expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-slate-400 opacity-50" />
            )}
          </div>
          <span className="truncate flex-1">{section.title}</span>
          <Circle className={cn("h-2 w-2 fill-current ml-2", getStatusColor(section.status))} />
        </div>
        {hasChildren && expanded && (
          <div className="mt-0.5">
            {section.children.map((child) => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {project.sections.map((section) => renderSection(section))}
    </div>
  )
}
