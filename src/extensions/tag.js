import { mergeAttributes } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import { PluginKey } from 'prosemirror-state'

const key = new PluginKey('tag')

export default Mention.extend({
  name: 'tag',

  defaultOptions: {
    ...Mention.defaultOptions,
    renderLabel ({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}}`
    },
    suggestion: {
      char: '{{',
      pluginKey: key,
      command: ({ editor, range, props }) => {
        // increase range.to by one when the next node is of type "text"
        // and starts with a space character
        const nodeAfter = editor.view.state.selection.$to.nodeAfter
        const overrideSpace = nodeAfter?.text?.startsWith(' ')

        if (overrideSpace) {
          range.to += 1
        }

        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'tag',
              attrs: props
            },
            {
              type: 'text',
              text: ' '
            }
          ])
          .run()
      },
      allow: ({ editor, range }) => {
        return editor.can().insertContentAt(range, { type: 'tag' })
      }
    }
  },

  parseHTML () {
    return [
      {
        tag: 'span[data-tag]'
      }
    ]
  },

  renderHTML ({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ 'data-tag': '' }, this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderLabel({
        options: this.options,
        node
      })
    ]
  }
})
