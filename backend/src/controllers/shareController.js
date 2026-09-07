import { prisma } from '../utils/prisma.js';

export const getDocumentShares = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    const shares = await prisma.documentShare.findMany({
      where: { documentId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(shares);
  } catch (error) {
    next(error);
  }
};

export const addShare = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const { userId, permission } = req.body;

    if (!userId || !permission) {
      return res.status(400).json({ error: 'userId and permission ("EDIT" or "VIEW") are required.' });
    }

    if (!['EDIT', 'VIEW'].includes(permission)) {
      return res.status(400).json({ error: 'Permission must be either "EDIT" or "VIEW".' });
    }

    // Verify document owner
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.ownerId === userId) {
      return res.status(400).json({ error: 'Cannot share a document with its owner.' });
    }

    // Upsert share record
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId
        }
      },
      update: { permission },
      create: {
        documentId,
        userId,
        permission
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
};

export const removeShare = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const { userId } = req.params;

    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId
        }
      }
    });

    if (!existingShare) {
      return res.status(404).json({ error: 'Share record not found for this user.' });
    }

    await prisma.documentShare.delete({
      where: {
        documentId_userId: {
          documentId,
          userId
        }
      }
    });

    res.json({ message: 'Access revoked successfully.', userId, documentId });
  } catch (error) {
    next(error);
  }
};
