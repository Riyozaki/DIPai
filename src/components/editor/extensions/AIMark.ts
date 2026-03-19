import { Mark, mergeAttributes } from '@tiptap/core'

export interface AIMarkOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiMark: {
      setAIMark: (attributes: { comment: string }) => ReturnType
      toggleAIMark: (attributes: { comment: string }) => ReturnType
      unsetAIMark: () => ReturnType
    }
  }
}

export const AIMark = Mark.create<AIMarkOptions>({
  name: 'aiMark',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-400 dark:border-yellow-600 cursor-pointer',
      },
    }
  },

  addAttributes() {
    return {
      comment: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment'),
        renderHTML: attributes => {
          if (!attributes.comment) {
            return {}
          }

          return {
            'data-comment': attributes.comment,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setAIMark: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleAIMark: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
      unsetAIMark: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
