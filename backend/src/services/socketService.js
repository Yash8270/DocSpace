import { Server } from 'socket.io';

const activeRooms = new Map(); // documentId -> Map(socketId -> user)
let globalIo = null;

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  globalIo = io;

  io.on('connection', (socket) => {
    let currentDocId = null;
    let currentUser = null;

    socket.on('join-document', ({ documentId, user }) => {
      if (!documentId || !user) return;

      currentDocId = documentId;
      currentUser = user;

      socket.join(`doc:${documentId}`);

      if (!activeRooms.has(documentId)) {
        activeRooms.set(documentId, new Map());
      }

      const roomMap = activeRooms.get(documentId);
      roomMap.set(socket.id, user);

      // Unique active users list
      const activeUsersList = Array.from(new Set(Array.from(roomMap.values()).map(u => u.id)))
        .map(id => Array.from(roomMap.values()).find(u => u.id === id));

      // Emit updated presence list to everyone in room
      io.to(`doc:${documentId}`).emit('presence-update', {
        documentId,
        activeUsers: activeUsersList
      });
    });

    // Handle live remote cursor & text selection movement (Google Docs style)
    socket.on('cursor-position-changed', ({ documentId, user, from, to }) => {
      if (!documentId || !user) return;
      socket.to(`doc:${documentId}`).emit('remote-cursor-changed', {
        documentId,
        user,
        from,
        to
      });
    });

    socket.on('document-content-changed', ({ documentId, user, title, content }) => {
      if (!documentId) return;

      // Broadcast update to all OTHER collaborators viewing this document
      socket.to(`doc:${documentId}`).emit('remote-document-changed', {
        documentId,
        user,
        title,
        content,
        updatedAt: new Date().toISOString()
      });
    });

    socket.on('document-deleted', ({ documentId, ownerName }) => {
      if (!documentId) return;
      io.to(`doc:${documentId}`).emit('document-deleted-notify', {
        documentId,
        ownerName: ownerName || 'The document owner'
      });
    });

    socket.on('leave-document', ({ documentId }) => {
      if (documentId && activeRooms.has(documentId)) {
        const roomMap = activeRooms.get(documentId);
        roomMap.delete(socket.id);

        socket.leave(`doc:${documentId}`);

        const activeUsersList = Array.from(new Set(Array.from(roomMap.values()).map(u => u.id)))
          .map(id => Array.from(roomMap.values()).find(u => u.id === id));

        io.to(`doc:${documentId}`).emit('presence-update', {
          documentId,
          activeUsers: activeUsersList
        });
      }
    });

    socket.on('disconnect', () => {
      if (currentDocId && activeRooms.has(currentDocId)) {
        const roomMap = activeRooms.get(currentDocId);
        roomMap.delete(socket.id);

        const activeUsersList = Array.from(new Set(Array.from(roomMap.values()).map(u => u.id)))
          .map(id => Array.from(roomMap.values()).find(u => u.id === id));

        io.to(`doc:${currentDocId}`).emit('presence-update', {
          documentId: currentDocId,
          activeUsers: activeUsersList
        });
      }
    });
  });

  return io;
};

export const broadcastDocumentDeletion = (documentId, ownerName) => {
  if (globalIo) {
    globalIo.to(`doc:${documentId}`).emit('document-deleted-notify', {
      documentId,
      ownerName: ownerName || 'The document owner'
    });
  }
};
