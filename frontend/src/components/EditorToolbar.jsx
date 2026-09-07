import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Lock
} from 'lucide-react';

export const EditorToolbar = ({ editor, readOnly = false }) => {
  if (!editor) return null;

  if (readOnly) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 border-b border-slate-200 text-slate-500 text-xs font-medium">
        <Lock className="w-3.5 h-3.5 text-amber-600" />
        <span>Editing toolbar is disabled in Read-Only mode</span>
      </div>
    );
  }

  const ToolbarButton = ({ onClick, isActive, disabled, title, children }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // Prevent losing active text selection
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg text-sm transition-all focus:outline-none cursor-pointer ${
        isActive
          ? 'bg-brand-100 text-brand-700 font-bold shadow-sm ring-1 ring-brand-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-slate-200/80 sticky top-0 z-10 shadow-sm">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().toggleBold().focus().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().toggleItalic().focus().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().toggleUnderline().focus().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().toggleHeading({ level: 1 }).focus().run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().toggleHeading({ level: 2 }).focus().run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().toggleBulletList().focus().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().toggleOrderedList().focus().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 ml-auto">
        <ToolbarButton
          onClick={() => editor.chain().undo().focus().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().redo().focus().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};
