import * as React from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import FontFamily from '@tiptap/extension-font-family'
import Link from '@tiptap/extension-link'
import { FontSize } from './extensions/FontSize'
import { LineHeight } from './extensions/LineHeight'
import { TextIndent } from './extensions/TextIndent'
import { Margin } from './extensions/Margin'
import { PageBreak } from './extensions/PageBreak'
import { InlineSuggestion } from './extensions/InlineSuggestion'
import { AIMark } from './extensions/AIMark'
import { useAppStore } from "@/src/store/useAppStore"
import { useEffect, useState } from "react"
import { EditorToolbar } from "./EditorToolbar"
import { AIFloatingToolbar } from "../ai/AIFloatingToolbar"
import { AIMarkToolbar } from "../ai/AIMarkToolbar"
import { AIGenerateModal } from "../ai/AIGenerateModal"
import { Button } from "../ui/Button"
import { Sparkles } from "lucide-react"

export function TipTapEditor({ projectId, sectionId }: { projectId: string, sectionId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId))
  const updateSectionContent = useAppStore((state) => state.updateSectionContent)

  const findSection = (sections: any[], id: string): any | null => {
    for (const sec of sections) {
      if (sec.id === id) return sec
      const found = findSection(sec.children, id)
      if (found) return found
    }
    return null
  }

  const section = project ? findSection(project.sections, sectionId) : null
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      FontFamily,
      Link.configure({
        openOnClick: false,
      }),
      FontSize,
      LineHeight,
      TextIndent,
      Margin,
      PageBreak,
      AIMark,
      InlineSuggestion.configure({
        projectId,
        context: `Тема: ${project?.title}\nРаздел: ${section?.title}`,
      }),
    ],
    content: section?.content || '',
    onUpdate: ({ editor }) => {
      updateSectionContent(projectId, sectionId, editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none',
      },
    },
  })

  useEffect(() => {
    if (editor && section && editor.getHTML() !== section.content) {
      editor.commands.setContent(section.content)
    }
  }, [sectionId, editor]) // Only run when sectionId changes

  if (!editor || !project) {
    return null
  }

  const gost = project.settings.gost

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
      <EditorToolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto p-8 flex justify-center relative">
        <div 
          className="bg-white dark:bg-slate-950 shadow-lg relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            paddingTop: `${gost.margins.top}cm`,
            paddingRight: `${gost.margins.right}cm`,
            paddingBottom: `${gost.margins.bottom}cm`,
            paddingLeft: `${gost.margins.left}cm`,
            fontFamily: gost.fontFamily,
            fontSize: `${gost.fontSize}pt`,
            lineHeight: gost.lineHeight,
          }}
        >
          {editor.isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Button 
                variant="outline" 
                className="pointer-events-auto gap-2 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                onClick={() => setIsGenerateModalOpen(true)}
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Сгенерировать с ИИ
              </Button>
            </div>
          )}
          <EditorContent editor={editor} className="h-full" />
          <AIFloatingToolbar editor={editor} projectId={projectId} />
          <AIMarkToolbar editor={editor} projectId={projectId} />
        </div>
      </div>
      
      <AIGenerateModal 
        projectId={projectId}
        sectionId={sectionId}
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerated={(content) => {
          editor.commands.setContent(content);
          updateSectionContent(projectId, sectionId, content);
        }}
      />
    </div>
  )
}
