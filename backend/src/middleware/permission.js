import { getDocumentPermission } from '../services/permissionService.js';

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Missing X-User-Id header.' });
  }
  next();
};

export const requireDocumentPermission = (action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required. Missing X-User-Id header.' });
      }

      const documentId = req.params.id || req.params.documentId;
      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required.' });
      }

      const access = await getDocumentPermission(req.user.id, documentId);

      if (!access) {
        return res.status(404).json({ error: 'Document not found.' });
      }

      req.documentAccess = access;

      let allowed = false;
      switch (action) {
        case 'READ':
          allowed = access.canRead;
          break;
        case 'EDIT':
          allowed = access.canEdit;
          break;
        case 'SHARE':
          allowed = access.canShare;
          break;
        case 'DELETE':
          allowed = access.canDelete;
          break;
        default:
          allowed = false;
      }

      if (!allowed) {
        return res.status(403).json({
          error: `Forbidden: You do not have '${action}' permission for this document.`
        });
      }

      next();
    } catch (error) {
      console.error('Error in permission middleware:', error);
      res.status(500).json({ error: 'Internal server error while evaluating permissions.' });
    }
  };
};
