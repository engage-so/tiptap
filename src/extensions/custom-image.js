import { dropImagePlugin } from './drop-image-plugin'
import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

export default Image.extend({
  name: 'customimage',

  defaultOptions: {
    ...Image.defaultOptions,
    upload: null
  },

  addAttributes () {
    return {
      ...Image.config.addAttributes(),
      width: {
        default: 'auto'
      },
      uploading: {
        default: 'true'
      },
      id: {
        default: ''
      }
    }
  },

  addCommands () {
    return {
      setImage: (options) => ({ tr, view, commands }) => {
        if (options.upload) {
          const image = options.upload

          const id = Math.random().toString(36).substring(5)
          const src = window.URL.createObjectURL(image)

          commands.insertContent({
            type: this.name,
            attrs: {
              id,
              src
            }
          })

          const img = new window.Image()
          img.src = src
          img.onload = () => {
            // Show blob source
            if (options.uploadFnc) {
              options.uploadFnc(image).then(src => {
                view.state.doc.descendants((node, pos) => {
                  if (node.attrs?.id === id) {
                    const w = view.dom.getBoundingClientRect()
                    const iw = Math.min(img.width, w.width)
                    const transaction = view.state.tr.setNodeMarkup(
                      pos, null, {
                        src,
                        uploading: false,
                        width: iw
                      }
                    )
                    view.dispatch(transaction)
                    // Free memory from createobjecturl
                    URL.revokeObjectURL(image)
                  }
                })
              }, () => {
                // Todo: On failure what's next?
              })
            }
          }
          return true
        }
        if (tr.selection?.node?.type?.name === 'customimage') {
          if (options.width && tr.selection?.node?.attrs?.width) {
            if (tr.selection.node.attrs.width === 'auto') {
              return
            }
            const width = +tr.selection.node.attrs.width
            if (options.width === 'decr' && width > 20) {
              options.width = width - 5
            } else if (options.width === 'inc') {
              options.width = width + 5
            }
          }
          return commands.updateAttributes('customimage', options)
        } else {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
      }
    }
  },

  renderHTML ({ node, HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    ]
  },

  addProseMirrorPlugins () {
    return [dropImagePlugin(this.options.upload)]
  }
})
