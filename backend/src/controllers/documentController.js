import {
  getUserDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} from '../services/documentService.js';
import { broadcastDocumentDeletion } from '../services/socketService.js';

export const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await getUserDocuments(userId);
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const createNewDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    const document = await createDocument(userId, { title, content });
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

export const getDocumentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const document = await getDocumentById(id, userId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocumentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updated = await updateDocument(id, { title, content });
    
    const access = req.documentAccess;
    res.json({
      ...updated,
      isOwner: access.isOwner,
      userPermission: access.permission
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerName = req.user?.name || 'The document owner';

    // Broadcast WebSocket deletion notification to active room collaborators
    broadcastDocumentDeletion(id, ownerName);

    await deleteDocument(id);
    res.json({ message: 'Document deleted successfully.', id });
  } catch (error) {
    next(error);
  }
};
