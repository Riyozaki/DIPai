import { Extension } from '@tiptap/core'

export interface MarginOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    margin: {
      setMarginLeft: (margin: string) => ReturnType
      setMarginRight: (margin: string) => ReturnType
      unsetMarginLeft: () => ReturnType
      unsetMarginRight: () => ReturnType
    }
  }
}

export const Margin = Extension.create<MarginOptions>({
  name: 'margin',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'list_item'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginLeft: {
            default: null,
            parseHTML: element => element.style.marginLeft || null,
            renderHTML: attributes => {
              if (!attributes.marginLeft) {
                return {}
              }
              return {
                style: `margin-left: ${attributes.marginLeft}`,
              }
            },
          },
          marginRight: {
            default: null,
            parseHTML: element => element.style.marginRight || null,
            renderHTML: attributes => {
              if (!attributes.marginRight) {
                return {}
              }
              return {
                style: `margin-right: ${attributes.marginRight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setMarginLeft: margin => ({ commands }) => {
        return this.options.types.every(type => commands.updateAttributes(type, { marginLeft: margin }))
      },
      setMarginRight: margin => ({ commands }) => {
        return this.options.types.every(type => commands.updateAttributes(type, { marginRight: margin }))
      },
      unsetMarginLeft: () => ({ commands }) => {
        return this.options.types.every(type => commands.resetAttributes(type, 'marginLeft'))
      },
      unsetMarginRight: () => ({ commands }) => {
        return this.options.types.every(type => commands.resetAttributes(type, 'marginRight'))
      },
    }
  },
})
