import * as React from "react"
import { useAppStore } from "@/src/store/useAppStore"
import { Upload, File as FileIcon, Trash2, CheckCircle2 } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/src/components/ui/Button"

export function FileManager({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))
  const addFile = useAppStore((state) => state.addFile)
  const deleteFile = useAppStore((state) => state.deleteFile)
  const toggleFileAI = useAppStore((state) => state.toggleFileAI)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!project) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        addFile(projectId, {
          name: file.name,
          type: file.name.endsWith('.txt') || file.name.endsWith('.md') ? 'instruction' : 'material',
          size: file.size,
          content: event.target?.result as string,
          includedInAI: true,
        })
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Файлы проекта</h3>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-3.5 w-3.5" /> Загрузить
        </Button>
        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      </div>

      <div className="space-y-2">
        {project.files.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">Нет загруженных файлов</p>
        ) : (
          project.files.map((file) => (
            <div key={file.id} className="group flex items-center justify-between rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center space-x-2 overflow-hidden">
                <FileIcon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate text-slate-700 dark:text-slate-300">{file.name}</span>
              </div>
              <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => toggleFileAI(projectId, file.id)}
                  className={`p-1 rounded-md ${file.includedInAI ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={file.includedInAI ? "Учтено ИИ" : "Не учтено ИИ"}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteFile(projectId, file.id)}
                  className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
