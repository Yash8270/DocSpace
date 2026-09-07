import { prisma } from '../utils/prisma.js';

export const getDocumentPermission = async (userId, documentId) => {
  if (!userId || !documentId) {
    return {
      isOwner: false,
      permission: null,
      canRead: false,
      canEdit: false,
      canShare: false,
      canDelete: false
    };
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, ownerId: true }
  });

  if (!document) {
    return null; // Document doesn't exist
  }

  // 1. Is user the Document Owner?
  if (document.ownerId === userId) {
    return {
      isOwner: true,
      permission: 'OWNER',
      canRead: true,
      canEdit: true,
      canShare: true,
      canDelete: true
    };
  }

  // 2. Is document shared with user?
  const share = await prisma.documentShare.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId
      }
    }
  });

  if (share) {
    const isEdit = share.permission === 'EDIT';
    return {
      isOwner: false,
      permission: share.permission,
      canRead: true,
      canEdit: isEdit,
      canShare: false,
      canDelete: false
    };
  }

  // 3. No access
  return {
    isOwner: false,
    permission: null,
    canRead: false,
    canEdit: false,
    canShare: false,
    canDelete: false
  };
};
