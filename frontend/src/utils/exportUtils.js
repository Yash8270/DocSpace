/**
 * Converts Tiptap JSON document AST into clean Markdown string
 */
export const tiptapToMarkdown = (jsonContent) => {
  if (!jsonContent) return '';

  let doc = jsonContent;
  if (typeof jsonContent === 'string') {
    try {
      doc = JSON.parse(jsonContent);
    } catch (e) {
      return jsonContent; // Fallback plain string
    }
  }

  if (!doc || !doc.content || !Array.isArray(doc.content)) {
    return '';
  }

  const parseInlineNode = (node) => {
    if (!node) return '';
    let text = node.text || '';
    if (!text) return '';

    if (node.marks && Array.isArray(node.marks)) {
      node.marks.forEach((mark) => {
        if (mark.type === 'bold') {
          text = `**${text}**`;
        } else if (mark.type === 'italic') {
          text = `*${text}*`;
        } else if (mark.type === 'underline') {
          text = `<u>${text}</u>`;
        }
      });
    }
    return text;
  };

  const parseInlineContent = (contentArray) => {
    if (!Array.isArray(contentArray)) return '';
    return contentArray.map(parseInlineNode).join('');
  };

  const processBlockNode = (node, indentLevel = 0) => {
    if (!node) return '';

    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level || 1;
        const prefix = '#'.repeat(level) + ' ';
        return `${prefix}${parseInlineContent(node.content)}\n\n`;
      }
      case 'paragraph': {
        const text = parseInlineContent(node.content);
        return text ? `${text}\n\n` : '\n';
      }
      case 'bulletList': {
        if (!Array.isArray(node.content)) return '';
        return node.content
          .map((item) => {
            const itemText = (item.content || [])
              .map((child) => processBlockNode(child, indentLevel + 1).trim())
              .join(' ');
            return `${'  '.repeat(indentLevel)}- ${itemText}`;
          })
          .join('\n') + '\n\n';
      }
      case 'orderedList': {
        if (!Array.isArray(node.content)) return '';
        return node.content
          .map((item, idx) => {
            const itemText = (item.content || [])
              .map((child) => processBlockNode(child, indentLevel + 1).trim())
              .join(' ');
            return `${'  '.repeat(indentLevel)}${idx + 1}. ${itemText}`;
          })
          .join('\n') + '\n\n';
      }
      default: {
        if (node.content && Array.isArray(node.content)) {
          return node.content.map((child) => processBlockNode(child, indentLevel)).join('');
        }
        return '';
      }
    }
  };

  const markdownResult = doc.content.map((node) => processBlockNode(node)).join('');
  return markdownResult.trim();
};

/**
 * Triggers browser download for Markdown (.md) document export
 */
export const exportToMarkdown = (title = 'Untitled Document', content) => {
  const markdownText = `# ${title}\n\n` + tiptapToMarkdown(content);
  const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const safeFilename = (title || 'document').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
  link.href = url;
  link.setAttribute('download', `${safeFilename}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Triggers clean PDF document print & export dialog
 */
export const exportToPdf = (title = 'Untitled Document', editorElement) => {
  const contentHtml = editorElement ? editorElement.innerHTML : '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export document to PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - DocSpace PDF Export</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.6;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 6px 0;
            color: #0f172a;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
          }
          .content h1 { font-size: 22px; font-weight: 700; margin-top: 18px; margin-bottom: 8px; }
          .content h2 { font-size: 18px; font-weight: 700; margin-top: 16px; margin-bottom: 6px; }
          .content h3 { font-size: 15px; font-weight: 600; margin-top: 14px; margin-bottom: 4px; }
          .content p { margin-top: 0; margin-bottom: 12px; font-size: 14px; }
          .content ul, .content ol { padding-left: 20px; margin-bottom: 12px; font-size: 14px; }
          .content li { margin-bottom: 4px; }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }
          .is-editor-empty { display: none; }
          .remote-cursor-widget, .remote-cursor-flag { display: none !important; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <div class="meta">Exported from DocSpace • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          DocSpace Collaborative Editor Document
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
