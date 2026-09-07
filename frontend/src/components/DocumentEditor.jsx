import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EditorToolbar } from './EditorToolbar';

const USER_COLORS = [
  { caret: 'remote-cursor-color-blue', selection: 'remote-selection-blue' },
  { caret: 'remote-cursor-color-purple', selection: 'remote-selection-purple' },
  { caret: 'remote-cursor-color-emerald', selection: 'remote-selection-emerald' },
  { caret: 'remote-cursor-color-amber', selection: 'remote-selection-amber' },
  { caret: 'remote-cursor-color-rose', selection: 'remote-selection-rose' }
];

const getCursorColorClasses = (name = '') => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return USER_COLORS[sum % USER_COLORS.length];
};

// Built-in Placeholder extension
const CustomPlaceholder = Extension.create({
  name: 'customPlaceholder',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('customPlaceholderPlugin'),
        props: {
          decorations: (state) => {
            const { doc } = state;
            if (doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0) {
              const deco = Decoration.node(0, doc.nodeSize - 2, {
                class: 'is-editor-empty',
                'data-placeholder': 'Start typing here...'
              });
              return DecorationSet.create(doc, [deco]);
            }
            return DecorationSet.empty;
          }
        }
      })
    ];
  }
});

export const DocumentEditor = ({
  initialContent,
  readOnly = false,
  remoteCursors = {},
  onSaveStatusChange,
  onContentChange,
  onCursorChange
}) => {
  const isFirstRender = useRef(true);
  const debounceTimer = useRef(null);

  // Parse initial content safely
  const getParsedContent = (rawContent) => {
    if (!rawContent) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph' }]
      };
    }
    if (typeof rawContent === 'object') return rawContent;
    try {
      const parsed = JSON.parse(rawContent);
      return parsed;
    } catch (e) {
      return rawContent;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      TextStyle,
      Color,
      CustomPlaceholder
    ],
    content: getParsedContent(initialContent),
    editable: !readOnly,
    onSelectionUpdate: ({ editor }) => {
      if (editor && !readOnly && editor.isFocused) {
        onCursorChange?.(editor.state.selection.from, editor.state.selection.to);
      }
    },
    onUpdate: ({ editor }) => {
      if (isFirstRender.current) return;

      onSaveStatusChange?.('unsaved');
      if (editor.isFocused) {
        onCursorChange?.(editor.state.selection.from, editor.state.selection.to);
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const jsonContent = editor.getJSON();
        onContentChange?.(jsonContent);
      }, 800);
    }
  });

  // Listen for remote WebSocket content updates from collaborators
  useEffect(() => {
    if (editor && initialContent) {
      try {
        const currentJsonStr = JSON.stringify(editor.getJSON());
        const incomingParsed = getParsedContent(initialContent);
        const incomingJsonStr = JSON.stringify(incomingParsed);

        if (currentJsonStr !== incomingJsonStr) {
          editor.commands.setContent(incomingParsed, false);
        }
      } catch (err) {
        console.error('Error syncing remote content to editor:', err);
      }
    }
  }, [editor, initialContent]);

  // Update remote cursor carets & text selection range highlights dynamically in ProseMirror
  useEffect(() => {
    if (!editor || !editor.view) return;

    try {
      const state = editor.state;
      const doc = state.doc;
      const decorations = [];

      Object.values(remoteCursors).forEach(({ user, from, to }) => {
        const start = typeof from === 'number' ? from : 0;
        const end = typeof to === 'number' ? to : start;

        // Only render if start position is valid (> 0) and user clicked inside editor
        if (user && start > 0 && start <= doc.content.size) {
          const colorClasses = getCursorColorClasses(user.name);

          // 1. Text Selection Range Highlight (if collaborator selected a block of text)
          if (end > start && end <= doc.content.size) {
            decorations.push(
              Decoration.inline(start, end, {
                class: `remote-selection ${colorClasses.selection}`
              })
            );
          }

          // 2. Cursor Caret + Floating Name Flag at selection end
          const caretPos = end > start ? end : start;
          const cursorWidget = window.document.createElement('span');
          cursorWidget.className = `remote-cursor-widget ${colorClasses.caret}`;

          const flag = window.document.createElement('span');
          flag.className = 'remote-cursor-flag';
          flag.textContent = user.name;
          cursorWidget.appendChild(flag);

          decorations.push(Decoration.widget(caretPos, cursorWidget, { side: 1 }));
        }
      });

      const decos = DecorationSet.create(doc, decorations);
      editor.view.setProps({
        decorations: () => decos
      });
    } catch (e) {
      console.warn('Remote cursor decoration update issue:', e);
    }
  }, [editor, remoteCursors]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  useEffect(() => {
    if (editor && initialContent && isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [editor, initialContent]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-editor overflow-hidden flex flex-col">
      <EditorToolbar editor={editor} readOnly={readOnly} />
      <div className="relative flex-1 bg-white min-h-[520px]">
        <EditorContent editor={editor} className="min-h-[520px] cursor-text" />
      </div>
    </div>
  );
};
