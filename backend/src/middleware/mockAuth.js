import { prisma } from '../utils/prisma.js';

const DEMO_USERS_MAP = {
  'usr_alice_1001': { name: 'Alice', email: 'alice@example.com' },
  'usr_bob_1002': { name: 'Bob', email: 'bob@example.com' },
  'usr_charlie_1003': { name: 'Charlie', email: 'charlie@example.com' }
};

export const mockAuth = async (req, res, next) => {
  try {
    let userId = req.headers['x-user-id'];

    if (!userId) {
      userId = 'usr_alice_1001'; // Default fallback user
    }

    const demoInfo = DEMO_USERS_MAP[userId] || {
      name: userId.replace('usr_', '').replace(/_\d+$/, ''),
      email: `${userId}@example.com`
    };

    // Upsert user automatically to prevent foreign key constraint violations
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: demoInfo.name,
        email: demoInfo.email
      }
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in mockAuth middleware:', error);
    // Fallback in-memory user
    req.user = { id: req.headers['x-user-id'] || 'usr_alice_1001', name: 'Alice', email: 'alice@example.com' };
    next();
  }
};
