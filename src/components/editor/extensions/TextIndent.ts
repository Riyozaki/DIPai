import { Extension } from '@tiptap/core'

export interface TextIndentOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textIndent: {
      /**
       * Set the text indent
       */
      setTextIndent: (textIndent: string) => ReturnType
      /**
       * Unset the text indent
       */
      unsetTextIndent: () => ReturnType
    }
  }
}

export const TextIndent = Extension.create<TextIndentOptions>({
  name: 'textIndent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textIndent: {
            default: null,
            parseHTML: element => element.style.textIndent || null,
            renderHTML: attributes => {
              if (!attributes.textIndent) {
                return {}
              }

              return {
                style: `text-indent: ${attributes.textIndent}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextIndent: textIndent => ({ commands }) => {
        return this.options.types.every(type => commands.updateAttributes(type, { textIndent }))
      },
      unsetTextIndent: () => ({ commands }) => {
        return this.options.types.every(type => commands.resetAttributes(type, 'textIndent'))
      },
    }
  },
})
