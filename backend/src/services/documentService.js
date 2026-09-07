import { prisma } from '../utils/prisma.js';

const createDefaultTiptapContent = () => {
  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph'
      }
    ]
  });
};

export const getUserDocuments = async (userId) => {
  // Ensure user exists in DB
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: userId.includes('alice') ? 'Alice' : userId.includes('bob') ? 'Bob' : userId.includes('charlie') ? 'Charlie' : 'Demo User',
      email: `${userId}@example.com`
    }
  });

  // 1. Owned documents
  const ownedDocs = await prisma.document.findMany({
    where: { ownerId: userId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const formattedOwnedDocs = ownedDocs.map((doc) => ({
    ...doc,
    isOwner: true,
    userPermission: 'OWNER'
  }));

  // 2. Shared documents
  const shares = await prisma.documentShare.findMany({
    where: { userId },
    include: {
      document: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          shares: {
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedSharedDocs = shares.map((s) => ({
    ...s.document,
    isOwner: false,
    userPermission: s.permission,
    shareInfo: {
      sharedAt: s.createdAt,
      permission: s.permission
    }
  }));

  return {
    ownedDocuments: formattedOwnedDocs,
    sharedDocuments: formattedSharedDocs
  };
};

export const createDocument = async (userId, { title, content }) => {
  // Ensure user exists in database before creating document
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: userId.includes('alice') ? 'Alice' : userId.includes('bob') ? 'Bob' : userId.includes('charlie') ? 'Charlie' : 'Demo User',
      email: `${userId}@example.com`
    }
  });

  const finalTitle = title && title.trim() ? title.trim() : 'Untitled Document';
  const finalContent = content
    ? (typeof content === 'string' ? content : JSON.stringify(content))
    : createDefaultTiptapContent();

  const document = await prisma.document.create({
    data: {
      title: finalTitle,
      content: finalContent,
      ownerId: userId
    },
    include: {
      owner: { select: { id: true, name: true, email: true } }
    }
  });

  return {
    ...document,
    isOwner: true,
    userPermission: 'OWNER'
  };
};

export const getDocumentById = async (documentId, userId) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  if (!document) return null;

  const isOwner = document.ownerId === userId;
  let userPermission = isOwner ? 'OWNER' : null;

  if (!isOwner) {
    const userShare = document.shares.find((s) => s.userId === userId);
    userPermission = userShare ? userShare.permission : null;
  }

  return {
    ...document,
    isOwner,
    userPermission
  };
};

export const updateDocument = async (documentId, { title, content }) => {
  const updateData = {};
  if (title !== undefined && title !== null) {
    updateData.title = title.trim() || 'Untitled Document';
  }
  if (content !== undefined && content !== null) {
    updateData.content = typeof content === 'string' ? content : JSON.stringify(content);
  }

  const updatedDoc = await prisma.document.update({
    where: { id: documentId },
    data: updateData,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  return updatedDoc;
};

export const deleteDocument = async (documentId) => {
  return await prisma.document.delete({
    where: { id: documentId }
  });
};
