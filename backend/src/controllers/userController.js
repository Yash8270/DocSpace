import { prisma } from '../utils/prisma.js';

const DEFAULT_DEMO_USERS = [
  { id: 'usr_alice_1001', name: 'Alice', email: 'alice@example.com' },
  { id: 'usr_bob_1002', name: 'Bob', email: 'bob@example.com' },
  { id: 'usr_charlie_1003', name: 'Charlie', email: 'charlie@example.com' }
];

export const getAllUsers = async (req, res, next) => {
  try {
    // Auto-ensure default demo users exist in DB even if database seed was not executed
    for (const user of DEFAULT_DEMO_USERS) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user
      });
    }

    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};
