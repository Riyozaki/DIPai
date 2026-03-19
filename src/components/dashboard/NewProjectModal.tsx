import * as React from "react"
import { useState } from "react"
import { Modal } from "@/src/components/ui/Modal"
import { Input } from "@/src/components/ui/Input"
import { Select } from "@/src/components/ui/Select"
import { Button } from "@/src/components/ui/Button"
import { useAppStore } from "@/src/store/useAppStore"
import { useNavigate } from "react-router-dom"

export function NewProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<'bachelor' | 'master' | 'specialist'>("bachelor")
  const [university, setUniversity] = useState("")
  const [department, setDepartment] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [advisor, setAdvisor] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())

  const createProject = useAppStore((state) => state.createProject)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const id = createProject(title, {
      type,
      university,
      department,
      specialty,
      advisor,
      year,
      theme: title
    })
    
    setActiveProject(id)
    onClose()
    navigate(`/editor/${id}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый проект (Дипломная работа)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Тема диплома</label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Разработка информационной системы..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Тип работы</label>
            <Select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { label: "Бакалаврская работа", value: "bachelor" },
                { label: "Магистерская диссертация", value: "master" },
                { label: "Диплом специалиста", value: "specialist" }
              ]} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Год защиты</label>
            <Input type="number" required value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Вуз и кафедра</label>
          <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="МГТУ им. Н.Э. Баумана, ИУ5" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Специальность / Направление</label>
          <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="09.03.04 Программная инженерия" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Научный руководитель</label>
          <Input value={advisor} onChange={(e) => setAdvisor(e.target.value)} placeholder="Иванов И.И., к.т.н., доцент" />
        </div>
        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
          <Button type="submit">Создать проект</Button>
        </div>
      </form>
    </Modal>
  )
}
