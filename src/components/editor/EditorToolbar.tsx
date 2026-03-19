import * as React from "react"
import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Superscript, Subscript, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, RemoveFormatting, Highlighter, Table as TableIcon,
  Image as ImageIcon, Link as LinkIcon, Quote, Code, Heading1, Heading2, Heading3,
  Indent, Outdent, ArrowLeftToLine, ArrowRightToLine, Minus, FilePlus
} from 'lucide-react'
import { Button } from "@/src/components/ui/Button"

export function EditorToolbar({ editor }: { editor: Editor }) {
  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleStrike = () => editor.chain().focus().toggleStrike().run()
  const toggleSuperscript = () => editor.chain().focus().toggleSuperscript().run()
  const toggleSubscript = () => editor.chain().focus().toggleSubscript().run()
  const clearFormat = () => editor.chain().focus().clearNodes().unsetAllMarks().run()

  const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => editor.chain().focus().setTextAlign(align).run()

  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run()
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run()

  const setHeading = (level: 1 | 2 | 3) => editor.chain().focus().toggleHeading({ level }).run()

  const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  const addImage = () => {
    const url = window.prompt('URL изображения')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const applyStyle = (style: string) => {
    switch (style) {
      case 'normal':
        editor.chain().focus().setParagraph().setFontFamily('Times New Roman').setFontSize('14pt').setTextAlign('justify').setLineHeight('1.5').setTextIndent('1.25cm').run()
        break
      case 'h1':
        editor.chain().focus().setHeading({ level: 1 }).setFontFamily('Times New Roman').setFontSize('16pt').setTextAlign('center').run()
        break
      case 'h2':
        editor.chain().focus().setHeading({ level: 2 }).setFontFamily('Times New Roman').setFontSize('14pt').setTextAlign('left').setTextIndent('1.25cm').run()
        break
      case 'h3':
        editor.chain().focus().setHeading({ level: 3 }).setFontFamily('Times New Roman').setFontSize('14pt').setTextAlign('left').setTextIndent('1.25cm').run()
        break
      case 'caption_figure':
        editor.chain().focus().setParagraph().setFontFamily('Times New Roman').setFontSize('12pt').setTextAlign('center').run()
        break
      case 'caption_table':
        editor.chain().focus().setParagraph().setFontFamily('Times New Roman').setFontSize('12pt').setTextAlign('left').run()
        break
      case 'code':
        editor.chain().focus().setCodeBlock().setFontFamily('Courier New').setFontSize('12pt').setLineHeight('1.0').run()
        break
    }
  }

  const fonts = ['Times New Roman', 'Arial', 'Courier New']
  const sizes = ['8', '10', '12', '14', '16', '18', '24', '36']
  const lineHeights = ['1.0', '1.15', '1.5', '2.0']

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
      {/* Styles */}
      <select
        className="h-8 rounded-md border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-700 dark:text-slate-50 dark:bg-slate-900"
        onChange={(e) => applyStyle(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Стиль</option>
        <option value="normal">Обычный текст</option>
        <option value="h1">Заголовок 1 (Глава)</option>
        <option value="h2">Заголовок 2 (Параграф)</option>
        <option value="h3">Заголовок 3 (Подпараграф)</option>
        <option value="caption_figure">Подпись рисунка</option>
        <option value="caption_table">Подпись таблицы</option>
        <option value="code">Код / Листинг</option>
      </select>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Font Family */}
      <select
        className="h-8 rounded-md border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-700 dark:text-slate-50 dark:bg-slate-900"
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontFamily || ''}
      >
        <option value="">Шрифт</option>
        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* Font Size */}
      <select
        className="h-8 rounded-md border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-700 dark:text-slate-50 dark:bg-slate-900"
        onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}pt`).run()}
        value={(editor.getAttributes('textStyle').fontSize || '').replace('pt', '')}
      >
        <option value="">Размер</option>
        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Basic Formatting */}
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleBold} title="Жирный (Ctrl+B)"><Bold className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleItalic} title="Курсив (Ctrl+I)"><Italic className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleUnderline} title="Подчеркнутый (Ctrl+U)"><UnderlineIcon className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleStrike} title="Зачеркнутый"><Strikethrough className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('superscript') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleSuperscript} title="Надстрочный"><Superscript className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('subscript') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleSubscript} title="Подстрочный"><Subscript className="h-4 w-4" /></Button>
      
      {/* Colors */}
      <input
        type="color"
        onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer"
        title="Цвет текста"
      />
      <input
        type="color"
        onInput={event => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
        value={editor.getAttributes('highlight').color || '#ffff00'}
        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer"
        title="Цвет выделения"
      />

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Alignment */}
      <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setAlign('left')} title="По левому краю"><AlignLeft className="h-4 w-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setAlign('center')} title="По центру"><AlignCenter className="h-4 w-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setAlign('right')} title="По правому краю"><AlignRight className="h-4 w-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setAlign('justify')} title="По ширине"><AlignJustify className="h-4 w-4" /></Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Lists & Indents */}
      <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleBulletList} title="Маркированный список"><List className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleOrderedList} title="Нумерованный список"><ListOrdered className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setTextIndent('1.25cm').run()} title="Абзацный отступ (1.25см)"><Indent className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().unsetTextIndent().run()} title="Убрать отступ"><Outdent className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setMarginLeft('2cm').run()} title="Отступ слева"><ArrowRightToLine className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().unsetMarginLeft().run()} title="Убрать отступ слева"><ArrowLeftToLine className="h-4 w-4" /></Button>

      {/* Line Height */}
      <select
        className="h-8 rounded-md border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-700 dark:text-slate-50 dark:bg-slate-900"
        onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
        value={editor.getAttributes('paragraph').lineHeight || ''}
        title="Межстрочный интервал"
      >
        <option value="">Интервал</option>
        {lineHeights.map(lh => <option key={lh} value={lh}>{lh}</option>)}
      </select>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Insertions */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertTable} title="Вставить таблицу"><TableIcon className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addImage} title="Вставить изображение"><ImageIcon className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('link') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={setLink} title="Вставить ссылку"><LinkIcon className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleBlockquote} title="Цитата"><Quote className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={toggleCodeBlock} title="Код"><Code className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Горизонтальная линия"><Minus className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setPageBreak().run()} title="Разрыв страницы"><FilePlus className="h-4 w-4" /></Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Clear Formatting */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearFormat} title="Очистить форматирование"><RemoveFormatting className="h-4 w-4" /></Button>
    </div>
  )
}
