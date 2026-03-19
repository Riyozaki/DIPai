import { useParams } from "react-router-dom"
import { useAppStore } from "@/src/store/useAppStore"
import { Sidebar } from "@/src/components/editor/Sidebar"
import { Toolbar } from "@/src/components/editor/Toolbar"
import { StatusBar } from "@/src/components/editor/StatusBar"
import { DocumentEditor } from "@/src/components/editor/DocumentEditor"
import { AIChatSidebar } from "@/src/components/ai/AIChatSidebar"
import { AIDocumentCheckModal } from "@/src/components/ai/AIDocumentCheckModal"
import { useEffect } from "react"

export default function Editor() {
  const { id } = useParams<{ id: string }>()
  const project = useAppStore((state) => state.projects.find((p) => p.id === id))
  const setActiveProject = useAppStore((state) => state.setActiveProject)

  useEffect(() => {
    if (id) setActiveProject(id)
    return () => setActiveProject(null)
  }, [id, setActiveProject])

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        Проект не найден
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-slate-950">
      <Toolbar projectId={project.id} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar projectId={project.id} />
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
          <DocumentEditor projectId={project.id} />
        </main>
        <AIChatSidebar projectId={project.id} />
      </div>
      <StatusBar projectId={project.id} />
      <AIDocumentCheckModal projectId={project.id} />
    </div>
  )
}
