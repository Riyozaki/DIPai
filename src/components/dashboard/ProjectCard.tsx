import * as React from "react"
import { Project } from "@/src/types"
import { motion } from "motion/react"
import { FileText, MoreVertical, Copy, Archive, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAppStore } from "@/src/store/useAppStore"
import { useNavigate } from "react-router-dom"

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { deleteProject, duplicateProject, setActiveProject } = useAppStore()
  const navigate = useNavigate()

  const handleOpen = () => {
    setActiveProject(project.id)
    navigate(`/editor/${project.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <FileText className="h-5 w-5" />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={() => { duplicateProject(project.id); setMenuOpen(false) }}
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Copy className="mr-2 h-4 w-4" /> Дублировать
              </button>
              <button
                onClick={() => { deleteProject(project.id); setMenuOpen(false) }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 cursor-pointer" onClick={handleOpen}>
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {new Date(project.updatedAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between cursor-pointer" onClick={handleOpen}>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {project.status === 'draft' ? 'Черновик' : project.status === 'in_progress' ? 'В работе' : 'Завершён'}
          </span>
        </div>
        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
          Открыть &rarr;
        </div>
      </div>
    </motion.div>
  )
}
