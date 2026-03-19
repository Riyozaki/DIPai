import * as React from "react"
import { useAppStore } from "@/src/store/useAppStore"
import { motion } from "motion/react"
import { TipTapEditor } from "./TipTapEditor"

export function DocumentEditor({ projectId }: { projectId: string }) {
  const activeSectionId = useAppStore((state) => state.activeSectionId)

  if (!activeSectionId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <p className="mb-2 text-lg font-medium">Выберите раздел для редактирования</p>
          <p className="text-sm">Или создайте новый в структуре слева</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 flex-col bg-white dark:bg-slate-950 overflow-hidden"
    >
      <TipTapEditor projectId={projectId} sectionId={activeSectionId} />
    </motion.div>
  )
}
