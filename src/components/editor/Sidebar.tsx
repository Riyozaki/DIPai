import { useState } from "react"
import { useAppStore } from "@/src/store/useAppStore"
import { StructureTree } from "./StructureTree"
import { FileManager } from "./FileManager"
import { GostSettings } from "./GostSettings"
import { Button } from "@/src/components/ui/Button"
import { ChevronLeft, ChevronRight, ListTree, FolderOpen, Settings2 } from "lucide-react"
import { cn } from "@/src/lib/utils"

export function Sidebar({ projectId }: { projectId: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'structure' | 'files' | 'gost'>('structure')

  return (
    <aside
      className={cn(
        "relative flex h-[calc(100vh-4rem)] flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/50",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-2 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'structure' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setActiveTab('structure')}
            >
              <ListTree className="mr-1 h-3.5 w-3.5" /> Структура
            </Button>
            <Button
              variant={activeTab === 'files' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setActiveTab('files')}
            >
              <FolderOpen className="mr-1 h-3.5 w-3.5" /> Файлы
            </Button>
            <Button
              variant={activeTab === 'gost' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setActiveTab('gost')}
            >
              <Settings2 className="mr-1 h-3.5 w-3.5" /> ГОСТ
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'structure' && <StructureTree projectId={projectId} />}
          {activeTab === 'files' && <FileManager projectId={projectId} />}
          {activeTab === 'gost' && <GostSettings projectId={projectId} />}
        </div>
      )}
    </aside>
  )
}
