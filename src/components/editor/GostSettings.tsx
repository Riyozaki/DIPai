import { useAppStore } from "@/src/store/useAppStore"
import { Input } from "@/src/components/ui/Input"
import { Select } from "@/src/components/ui/Select"

export function GostSettings({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))

  if (!project) return null

  const gost = project.settings.gost

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Параметры ГОСТ</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Шрифт</label>
          <Select
            value={gost.fontFamily}
            onChange={() => {}}
            options={[
              { label: "Times New Roman", value: "Times New Roman" },
              { label: "Arial", value: "Arial" },
              { label: "Calibri", value: "Calibri" }
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Размер (пт)</label>
            <Input type="number" value={gost.fontSize} onChange={() => {}} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Интервал</label>
            <Input type="number" step="0.1" value={gost.lineHeight} onChange={() => {}} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Поля (см)</label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            <Input type="number" value={gost.margins.top} onChange={() => {}} title="Верхнее" placeholder="В" />
            <Input type="number" value={gost.margins.right} onChange={() => {}} title="Правое" placeholder="П" />
            <Input type="number" value={gost.margins.bottom} onChange={() => {}} title="Нижнее" placeholder="Н" />
            <Input type="number" value={gost.margins.left} onChange={() => {}} title="Левое" placeholder="Л" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Стиль ссылок</label>
          <Select
            value={gost.linkStyle}
            onChange={() => {}}
            options={[
              { label: "ГОСТ Р 7.0.5-2008", value: "ГОСТ Р 7.0.5-2008" },
              { label: "ГОСТ 7.1-2003", value: "ГОСТ 7.1-2003" }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
