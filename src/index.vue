<template>
  <div v-if="editor" class="tiptap-editor">
    <floating-menu v-if="mode !== 'simple'" :editor="editor" class="floating-menu">
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        <format-header1 />
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        <format-header2 />
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        <format-header3 />
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        <format-list-bulleted />
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        <format-list-numbered />
      </button>
      <button v-if="mode !== 'no-image'">
        <label><image-area /><span style="display:none"><input type="file" accept="image/*" @change="uploadImage"></span></label>
      </button>
    </floating-menu>

    <bubble-menu v-if="mode !== 'simple'" :editor="editor" v-show="!editor.isActive('customimage')" class="bubble-menu">
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        <format-header1 />
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        <format-header2 />
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        <format-header3 />
      </button>
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <format-bold />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <format-italic />
      </button>
      <button @click="openLink" :class="{ 'is-active': editor.isActive('link') }">
        <link-variant />
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }">
        <format-underline />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        <format-strikethrough />
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        <format-list-bulleted />
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        <format-list-numbered />
      </button>
      <div class="link" v-show="showLinkPop">
        <form @submit.prevent="onSubmitLink"><input type="text" ref="url" @blur="hideLinkPop" placeholder="https://" v-model="linkUrl"><button type="button" @click="unsetLink"><close /></button></form>
      </div>
    </bubble-menu>

    <bubble-menu :editor="editor" v-show="editor.isActive('customimage') && !editor.getAttributes('customimage').uploading" :tippyOptions="{ placement: 'top-start' }" class="bubble-menu">
      <div>Size:</div>
      <button @click="editor.chain().focus().setImage({ width: 'decr' }).run()">
        <minus />
      </button>
      <button @click="editor.chain().focus().setImage({ width: 'inc' }).run()">
        <plus />
      </button>
    </bubble-menu>

    <editor-content :editor="editor" v-model="value" />
  </div>
</template>

<script>
import tippy from 'tippy.js'
import { Editor, EditorContent, VueRenderer, FloatingMenu, BubbleMenu } from '@tiptap/vue-2'
import Underline from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
import MentionList from './MentionList.vue'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

import Tag from './extensions/tag'
import CustomImage from './extensions/custom-image'
import uploadFile from './extensions/upload'

import FormatBold from 'vue-material-design-icons/FormatBold.vue'
import FormatStrikethrough from 'vue-material-design-icons/FormatStrikethrough.vue'
import FormatUnderline from 'vue-material-design-icons/FormatUnderline.vue'
import FormatItalic from 'vue-material-design-icons/FormatItalic.vue'
import FormatHeader1 from 'vue-material-design-icons/FormatHeader1.vue'
import FormatHeader2 from 'vue-material-design-icons/FormatHeader2.vue'
import FormatHeader3 from 'vue-material-design-icons/FormatHeader3.vue'
import FormatListBulleted from 'vue-material-design-icons/FormatListBulleted.vue'
import FormatListNumbered from 'vue-material-design-icons/FormatListNumbered.vue'
import LinkVariant from 'vue-material-design-icons/LinkVariant.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ImageArea from 'vue-material-design-icons/ImageArea.vue'
import Minus from 'vue-material-design-icons/Minus.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

export default {
  name: 'tiptapEditor',
  components: {
    FormatBold,
    FormatStrikethrough,
    FormatUnderline,
    FormatItalic,
    FormatHeader1,
    FormatHeader2,
    FormatHeader3,
    FormatListBulleted,
    FormatListNumbered,
    LinkVariant,
    Close,
    ImageArea,
    Plus,
    Minus,

    EditorContent,
    FloatingMenu,
    BubbleMenu
  },

  props: {
    mode: {
      type: String
    },
    value: {
      type: String
    },
    tags: {
      type: Array,
      default() {
          return []
      }
    },
    mentions: {
      type: Array,
      default() {
          return []
      }
    },
    photos: {
      type: Array
    },
    placeholder: {
      type: String
    }
  },

  watch: {

  },

  data() {
    return {
      imageTab: this.photos?.length ? 'gallery' : 'upload',
      showLinkPop: false,
      linkUrl: '',
      editor: null,
      autofocus: false
    }
  },

  mounted() {
    const extensions = [
      StarterKit.configure({
        bold: this.mode === 'simple' ? false : true,
        code: this.mode === 'simple' ? false : true,
        italic: this.mode === 'simple' ? false : true,
        strike: this.mode === 'simple' ? false : true,
        blockquote: this.mode === 'simple' ? false : true,
        bulletList: this.mode === 'simple' ? false : true,
        codeBlock: this.mode === 'simple' ? false : true,
        horizontalRule: this.mode === 'simple' ? false : true,
        listItem: this.mode === 'simple' ? false : true,
        orderedList: this.mode === 'simple' ? false : true,
        horizontalRule: this.mode === 'simple' ? false : true,
        heading: this.mode === 'simple' ? false : true
      }),
      Placeholder.configure({
        placeholder: this.placeholder ?? 'Write something...',
      }),
      Tag.configure({
        HTMLAttributes: {
          class: 'ptag',
        },
        suggestion: {
          char: '{{',
          items: query => {
            return this.tags.filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
          },
          render: () => {
            let component
            let popup

            return {
              onStart: props => {
                component = new VueRenderer(MentionList, {
                  parent: this,
                  propsData: props,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props) {
                component.updateProps(props)

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()

                  return true
                }

                return component.ref?.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        }
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        renderLabel({ options, node }) {
          return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          char: '@',
          items: query => {
            return this.mentions.filter(item => {
              return item.value ?
                item.value.toLowerCase().startsWith(query.toLowerCase()) :
                item.toLowerCase().startsWith(query.toLowerCase())
            }).slice(0, 10)
          },
          render: () => {
            let component
            let popup

            return {
              onStart: props => {
                component = new VueRenderer(MentionList, {
                  parent: this,
                  propsData: props,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props) {
                component.updateProps(props)

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()

                  return true
                }

                return component.ref?.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              }
            }
          }
        }
      })
    ]
    if (this.mode !== 'no-image') {
      extensions.push(CustomImage.configure({
        upload: uploadFile
      }))
    }
    if (this.mode !== 'simple') {
      extensions.push(
        Underline,
        Link.configure({
          openOnClick: false,
        })
      )
    }

    this.editor = new Editor({
      extensions,
      autofocus: this.autofocus,
      onUpdate: ({ editor }) => {
        this.$emit("input", editor.getHTML())
      },
      content: this.value
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },

  methods: {
    openLink() {
      this.showLinkPop = true
      this.$nextTick(() => {
        this.$refs.url.focus()
      })
    },
    hideLinkPop() {
      setTimeout(() => {
        this.showLinkPop = false
      }, 200)
    },
    onSubmitLink() {
      this.showLinkPop = false

      // empty
      if (this.linkUrl === '') {
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run()

        return
      }

      // update link
      this.editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: this.linkUrl })
        .run()
    },
    unsetLink() {
      this.linkUrl = ''
      this.editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()
    },
    uploadImage(e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      const image = files[0]
      this.editor
        .chain()
        .focus()
        .setImage({ upload: image, uploadFnc: uploadFile })
        .run()
    }
  }
}
</script>

<style lang="scss">
.tiptap-editor {
  .ProseMirror {
    padding: 10px 20px;
    outline: 0;

    > * + * {
      margin-top: 0.75em;
    }

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #ced4da;
      pointer-events: none;
      height: 0;
    }
  }

  .ProseMirror-focused {
    p.is-editor-empty:first-child::before {
      color: transparent;
    }
  }

  .lh-copy {
    line-height: 1.2rem
  }
  .flex {
    display: flex;
  }
  .w-100 {
    width: 100%
  }
  .center {
    text-align: center;
    padding: 4rem
  }

  .ptag {
    color: #555;
    background-color: rgba(#555, 0.1);
    border-radius: 0.3rem;
    padding: 0.1rem 0.3rem;
  }
  .mention {
    color: #1322c4;
    background-color: rgba(#1322c4, 0.1);
    border-radius: 0.3rem;
    padding: 0.1rem 0.3rem;
  }

  .bubble-menu {
    display: flex;
    color: #fafafa;
    background-color: #0D0D0D;
    padding: 0.2rem;
    border-radius: 0.3rem;

    button {
      border: none;
      background: none;
      color: #FFF;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0 0.2rem;
      opacity: 0.6;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover,
      &.is-active {
        opacity: 1;
      }
    }

    .link {
      z-index: 1;
      padding: 0.3rem;
      position: absolute;
      background-color: #fafafa;
      border-radius: 0.2rem;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.1),
        0px 10px 20px rgba(0, 0, 0, 0.1)
      ;
      
      form {
        display: flex;
        align-items: center;
      }

      input {
        border: 1px solid #bbb;
        min-width: 200px;
        border-radius: 0.2rem;
        outline: 0;
        padding: 3px
      }

      button {
        border: none;
        background: none;
        color: rgb(119, 8, 8);
        font-size: 0.85rem;
        font-weight: 500;
        padding: 0 0.2rem;
        opacity: 0.6;

        &:hover,
        &.is-active {
          opacity: 1;
        }
      }
    }
  }

  .floating-menu {
    display: flex;
    background-color: #0D0D0D10;
    padding: 0.2rem;
    border-radius: 0.3rem;

    button {
      border: none;
      background: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0 0.2rem;
      opacity: 0.6;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover,
      &.is-active {
        opacity: 1;
      }
    }
  }

  .image-wrp {
    z-index: 1;
    padding: 1rem;
    position: absolute;
    width: 50%;
    max-height: 50%;
    overflow-y: scroll;
    left: 25%;
    background-color: #fafafa;
    border-radius: 0.2rem;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.1),
      0px 10px 20px rgba(0, 0, 0, 0.1)
    ;

    nav {
      display: flex;
      margin-bottom: 1rem;

      a {
        display: block;
        padding-right: 0.8rem;
        color: #777;
        text-decoration: none;

        &:hover,
        &.is-active {
          color: #000;
        }
      }
    }

    .dropzone {
      border: 1px dashed #ccc;
      text-align: center;
      padding: 4rem
    }
  }

  img {
    max-width: 100%;
    display: block;
    height: auto;

    &.ProseMirror-selectednode {
      outline: 3px solid #68CEF8;
    }

    &[uploading=true] {
      opacity: 0.4;
    }
  }
}
</style>
