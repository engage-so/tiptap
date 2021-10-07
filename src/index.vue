<template>
  <div v-if="editor" class="tiptap-editor">
    <floating-menu :editor="editor" class="floating-menu">
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
        <format-list-numbered />
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        <format-list-bulleted />
      </button>
    </floating-menu>

    <bubble-menu :editor="editor" class="bubble-menu">
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
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }">
        <format-underline />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        <format-strikethrough />
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        <format-list-numbered />
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        <format-list-bulleted />
      </button>
    </bubble-menu>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import tippy from 'tippy.js'
import { Editor, EditorContent, VueRenderer, FloatingMenu, BubbleMenu } from '@tiptap/vue-2'
import Underline from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
import MentionList from './MentionList.vue'
import StarterKit from '@tiptap/starter-kit'

import FormatBold from 'vue-material-design-icons/FormatBold.vue'
import FormatStrikethrough from 'vue-material-design-icons/FormatStrikethrough.vue'
import FormatUnderline from 'vue-material-design-icons/FormatUnderline.vue'
import FormatItalic from 'vue-material-design-icons/FormatItalic.vue'
import FormatHeader1 from 'vue-material-design-icons/FormatHeader1.vue'
import FormatHeader2 from 'vue-material-design-icons/FormatHeader2.vue'
import FormatHeader3 from 'vue-material-design-icons/FormatHeader3.vue'
import FormatListBulleted from 'vue-material-design-icons/FormatListBulleted.vue'
import FormatListNumbered from 'vue-material-design-icons/FormatListNumbered.vue'

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
    EditorContent,
    FloatingMenu,
    BubbleMenu
  },

  props: {
    tags: {
      type: Array,
      required: true,
    }
  },

  data() {
    return {
      editor: null
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Underline,
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: 'ptag',
          },
          renderLabel({ options, node }) {
            return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}}`
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
          },
        }),
      ],
      content: `
        <p>Hi everyone! Don’t forget the daily stand up at 8 AM.</p>
        <p><span data-mention data-id="Jennifer Grey"></span> Would you mind to share what you’ve been working on lately? We fear not much happened since Dirty Dancing.
        <p><span data-mention data-id="Winona Ryder"></span> <span data-mention data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-mention data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your big boss</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">

.ProseMirror {
  padding: 10px 20px;

  > * + * {
    margin-top: 0.75em;
  }
}

.ptag {
  color: #555;
  background-color: rgba(#555, 0.1);
  border-radius: 0.3rem;
  padding: 0.1rem 0.3rem;
}

.bubble-menu {
  display: flex;
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
</style>
