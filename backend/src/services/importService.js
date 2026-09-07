/**
 * Converts inline Markdown formatting (**bold**, *italic*) into Tiptap mark objects.
 */
function parseInlineMarkdown(text) {
  if (!text) return [];
  
  // Simple regex parser for **bold** and *italic*
  const tokens = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Match bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)$/s);
    if (boldMatch) {
      const [, before, boldText, after] = boldMatch;
      if (before) tokens.push({ type: 'text', text: before });
      tokens.push({
        type: 'text',
        marks: [{ type: 'bold' }],
        text: boldText
      });
      remaining = after;
      continue;
    }

    // Match italic *text*
    const italicMatch = remaining.match(/^(.*?)\*(.*?)\*(.*)$/s);
    if (italicMatch) {
      const [, before, italicText, after] = italicMatch;
      if (before) tokens.push({ type: 'text', text: before });
      tokens.push({
        type: 'text',
        marks: [{ type: 'italic' }],
        text: italicText
      });
      remaining = after;
      continue;
    }

    // Match underline <u>text</u>
    const underlineMatch = remaining.match(/^(.*?)<u>(.*?)<\/u>(.*)$/s);
    if (underlineMatch) {
      const [, before, underlineText, after] = underlineMatch;
      if (before) tokens.push({ type: 'text', text: before });
      tokens.push({
        type: 'text',
        marks: [{ type: 'underline' }],
        text: underlineText
      });
      remaining = after;
      continue;
    }

    // Plain text remainder
    tokens.push({ type: 'text', text: remaining });
    break;
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', text }];
}

/**
 * Parses plain text file buffer/string into Tiptap JSON doc
 */
export function parseTxtToTiptap(fileContent, filename = 'Imported Document') {
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const contentNodes = lines.map(line => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line }]
  }));

  if (contentNodes.length === 0) {
    contentNodes.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    });
  }

  return {
    title: filename.replace(/\.[^/.]+$/, ''),
    tiptapJson: {
      type: 'doc',
      content: contentNodes
    }
  };
}

/**
 * Parses Markdown file buffer/string into Tiptap JSON doc
 */
export function parseMarkdownToTiptap(fileContent, filename = 'Imported Markdown') {
  const lines = fileContent.split(/\r?\n/);
  const contentNodes = [];

  let currentBulletList = null;
  let currentOrderedList = null;

  const flushLists = () => {
    if (currentBulletList) {
      contentNodes.push(currentBulletList);
      currentBulletList = null;
    }
    if (currentOrderedList) {
      contentNodes.push(currentOrderedList);
      currentOrderedList = null;
    }
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      continue;
    }

    // Heading 1 (# Title)
    if (line.startsWith('# ')) {
      flushLists();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineMarkdown(line.substring(2))
      });
      continue;
    }

    // Heading 2 (## Subheading)
    if (line.startsWith('## ')) {
      flushLists();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineMarkdown(line.substring(3))
      });
      continue;
    }

    // Heading 3 (### Subheading)
    if (line.startsWith('### ')) {
      flushLists();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 3 },
        content: parseInlineMarkdown(line.substring(4))
      });
      continue;
    }

    // Bullet List (- item or * item)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (currentOrderedList) flushLists();
      if (!currentBulletList) {
        currentBulletList = { type: 'bulletList', content: [] };
      }
      const itemText = line.substring(2);
      currentBulletList.content.push({
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInlineMarkdown(itemText) }]
      });
      continue;
    }

    // Ordered List (1. item, 2. item)
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (currentBulletList) flushLists();
      if (!currentOrderedList) {
        currentOrderedList = { type: 'orderedList', content: [] };
      }
      const itemText = orderedMatch[1];
      currentOrderedList.content.push({
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInlineMarkdown(itemText) }]
      });
      continue;
    }

    // Standard Paragraph
    flushLists();
    contentNodes.push({
      type: 'paragraph',
      content: parseInlineMarkdown(line)
    });
  }

  flushLists();

  if (contentNodes.length === 0) {
    contentNodes.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    });
  }

  // Use document's H1 title if present, otherwise fallback to filename
  let docTitle = filename.replace(/\.[^/.]+$/, '');
  if (contentNodes[0] && contentNodes[0].type === 'heading' && contentNodes[0].content[0]) {
    docTitle = contentNodes[0].content[0].text;
  }

  return {
    title: docTitle,
    tiptapJson: {
      type: 'doc',
      content: contentNodes
    }
  };
}
