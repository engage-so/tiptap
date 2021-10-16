import { Plugin, PluginKey } from 'prosemirror-state'

export const dropImagePlugin = (upload) => {
  return new Plugin({
    key: new PluginKey('drop-image'),
    props: {
      handlePaste (view, event) {
        const items = Array.from(event.clipboardData?.items || [])
        const { schema } = view.state

        const w = view.dom.getBoundingClientRect()

        items.forEach((item) => {
          const image = item.getAsFile()

          if (item.type.indexOf('image') === 0) {
            event.preventDefault()

            const img = new window.Image()
            img.src = window.URL.createObjectURL(image)
            img.onload = function () {
              // Show blob source
              const id = Math.random().toString(36).substring(5)
              const iw = Math.min(img.width, w.width)
              const node = schema.nodes.customimage.create({
                id,
                src: img.src,
                width: iw
              })

              const transaction = view.state.tr.replaceSelectionWith(node)
              view.dispatch(transaction)

              if (upload) {
                upload(image).then(src => {
                  view.state.doc.descendants((node, pos) => {
                    if (node.attrs?.id === id) {
                      const transaction = view.state.tr.setNodeMarkup(
                        pos, null, {
                          src,
                          uploading: false,
                          width: img.width
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
          }
        })

        return false
      },

      handleDOMEvents: {
        drop: (view, event) => {
          const hasFiles =
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files.length

          if (!hasFiles) {
            return false
          }

          const w = view.dom.getBoundingClientRect()

          const images = Array.from(
            event.dataTransfer?.files ?? []
          ).filter((file) => /image/i.test(file.type))

          if (images.length === 0) {
            return false
          }

          event.preventDefault()

          const { schema } = view.state
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          })
          if (!coordinates) return false
          const nodes = []

          images.forEach(async (image) => {
            // Get size
            const img = new window.Image()
            img.src = window.URL.createObjectURL(image)
            img.onload = function () {
              const id = Math.random().toString(36).substring(5)
              const iw = Math.min(img.width, w.width)
              const node = schema.nodes.customimage.create({
                id,
                src: img.src,
                width: iw
              })
              nodes.push(node)

              if (upload) {
                upload(image).then(src => {
                  view.state.doc.descendants((node, pos) => {
                    if (node.attrs?.id === id) {
                      const transaction = view.state.tr.setNodeMarkup(
                        pos, null, {
                          src,
                          uploading: false,
                          width: img.width
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

              if (nodes.length === images.length) {
                console.log(coordinates.pos)
                const transaction = view.state.tr.insert(coordinates.pos, nodes)
                view.dispatch(transaction)
              }
            }
          })

          return true
        }
      }
    }
  })
}
