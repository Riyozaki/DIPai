import { useAppStore } from "@/src/store/useAppStore"
import { Button } from "@/src/components/ui/Button"
import { Modal } from "@/src/components/ui/Modal"
import { ArrowLeft, Moon, Sun, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Settings() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const aiSettings = useAppStore((state) => state.aiSettings)
  const updateAISettings = useAppStore((state) => state.updateAISettings)
  const navigate = useNavigate()
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)

  const handleClearData = async () => {
    // Clear indexedDB via idb-keyval
    const { clear } = await import('idb-keyval')
    await clear()
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Настройки</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Настройки ИИ
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Модель Gemini
                </label>
                <select
                  value={aiSettings?.model || 'gemini-3-flash-preview'}
                  onChange={(e) => updateAISettings({ model: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Быстрая, по умолчанию)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Умная, для сложных задач)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">Flash работает быстрее, Pro лучше справляется со сложным анализом и генерацией длинных текстов.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Системный промпт (Инструкция для ИИ)
                </label>
                <textarea
                  value={aiSettings?.systemPrompt || ''}
                  onChange={(e) => updateAISettings({ systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Ты — профессиональный академический писатель..."
                />
                <p className="mt-1 text-xs text-slate-500">Эта инструкция отправляется ИИ при каждом запросе, задавая его роль и стиль общения.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Креативность (Temperature): {aiSettings?.temperature || 0.7}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiSettings?.temperature || 0.7}
                  onChange={(e) => updateAISettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Точность (0.0)</span>
                  <span>Баланс (0.7)</span>
                  <span>Креативность (1.0)</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Внешний вид</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Тема оформления</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Выберите светлую или тёмную тему</p>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
                <Button
                  variant={theme === 'light' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="h-8 px-3"
                >
                  <Sun className="mr-2 h-4 w-4" /> Светлая
                </Button>
                <Button
                  variant={theme === 'dark' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-8 px-3"
                >
                  <Moon className="mr-2 h-4 w-4" /> Тёмная
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Данные</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Очистить локальные данные</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Удалить все проекты и файлы из браузера</p>
              </div>
              <Button variant="destructive" onClick={() => setIsClearModalOpen(true)}>
                Очистить
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title="Очистить данные?">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Вы уверены, что хотите удалить все проекты и файлы? Это действие необратимо.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsClearModalOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleClearData}>Удалить всё</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
