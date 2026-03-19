import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { aiService } from '@/src/services/aiService';

export interface InlineSuggestionOptions {
  projectId: string;
  context: string;
}

const suggestionPluginKey = new PluginKey('inlineSuggestion');

export const InlineSuggestion = Extension.create<InlineSuggestionOptions>({
  name: 'inlineSuggestion',

  addOptions() {
    return {
      projectId: '',
      context: '',
    };
  },

  addProseMirrorPlugins() {
    let timeout: NodeJS.Timeout;
    let currentSuggestion = '';
    let suggestionPos = 0;

    const options = this.options;

    return [
      new Plugin({
        key: suggestionPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            const meta = tr.getMeta(suggestionPluginKey);
            if (meta && meta.type === 'set') {
              currentSuggestion = meta.suggestion;
              suggestionPos = meta.pos;
              
              if (!currentSuggestion) return DecorationSet.empty;

              const widget = document.createElement('span');
              widget.className = 'text-slate-400 dark:text-slate-500 italic pointer-events-none select-none';
              widget.textContent = currentSuggestion;

              const deco = Decoration.widget(suggestionPos, widget, {
                side: 1,
              });
              return DecorationSet.create(tr.doc, [deco]);
            }
            if (meta && meta.type === 'clear') {
              currentSuggestion = '';
              return DecorationSet.empty;
            }
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleKeyDown(view, event) {
            if (currentSuggestion && event.key === 'Tab') {
              event.preventDefault();
              const tr = view.state.tr.insertText(currentSuggestion, suggestionPos);
              view.dispatch(tr.setMeta(suggestionPluginKey, { type: 'clear' }));
              return true;
            }
            if (currentSuggestion && event.key === 'Escape') {
              event.preventDefault();
              view.dispatch(view.state.tr.setMeta(suggestionPluginKey, { type: 'clear' }));
              return true;
            }
            // Clear on any other key
            if (currentSuggestion && event.key.length === 1) {
              view.dispatch(view.state.tr.setMeta(suggestionPluginKey, { type: 'clear' }));
            }
            return false;
          },
        },
        view(view) {
          return {
            update(view, prevState) {
              if (view.state.doc.eq(prevState.doc)) return;

              clearTimeout(timeout);
              
              const { selection } = view.state;
              if (!selection.empty) {
                view.dispatch(view.state.tr.setMeta(suggestionPluginKey, { type: 'clear' }));
                return;
              }

              const pos = selection.from;
              const textBefore = view.state.doc.textBetween(Math.max(0, pos - 500), pos, ' ');

              if (textBefore.trim().length < 10) return;

              timeout = setTimeout(async () => {
                try {
                  const suggestion = await aiService.suggestContinuation(
                    options.context || '',
                    textBefore
                  );
                  if (suggestion) {
                    view.dispatch(
                      view.state.tr.setMeta(suggestionPluginKey, {
                        type: 'set',
                        suggestion: ' ' + suggestion,
                        pos,
                      })
                    );
                  }
                } catch (e) {
                  console.error('Failed to get suggestion', e);
                }
              }, 2000); // 2 seconds pause
            },
            destroy() {
              clearTimeout(timeout);
            },
          };
        },
      }),
    ];
  },
});
