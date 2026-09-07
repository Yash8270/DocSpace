import { parseTxtToTiptap, parseMarkdownToTiptap } from '../services/importService.js';
import { createDocument } from '../services/documentService.js';

export const importFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a .txt or .md file.' });
    }

    const filename = req.file.originalname;
    const fileBuffer = req.file.buffer.toString('utf-8');
    const ext = filename.split('.').pop()?.toLowerCase();

    if (!['txt', 'md', 'markdown'].includes(ext)) {
      return res.status(400).json({
        error: `Unsupported file format '.${ext}'. Supported formats are: .txt, .md`
      });
    }

    let parsed;
    if (ext === 'txt') {
      parsed = parseTxtToTiptap(fileBuffer, filename);
    } else {
      parsed = parseMarkdownToTiptap(fileBuffer, filename);
    }

    const userId = req.user.id;
    const newDoc = await createDocument(userId, {
      title: parsed.title,
      content: parsed.tiptapJson
    });

    res.status(201).json({
      message: 'File imported successfully.',
      document: newDoc
    });
  } catch (error) {
    next(error);
  }
};
