import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultDocContent = (bodyText) => JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: bodyText }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Key milestone 1: System architecture setup' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Key milestone 2: Rich text editor & autosave' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Key milestone 3: Granular sharing & permissions' }] }]
        }
      ]
    }
  ]
});

async function main() {
  console.log('Seeding DocSpace database...');

  // Clean existing data
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const alice = await prisma.user.create({
    data: {
      id: 'usr_alice_1001',
      name: 'Alice',
      email: 'alice@example.com'
    }
  });

  const bob = await prisma.user.create({
    data: {
      id: 'usr_bob_1002',
      name: 'Bob',
      email: 'bob@example.com'
    }
  });

  const charlie = await prisma.user.create({
    data: {
      id: 'usr_charlie_1003',
      name: 'Charlie',
      email: 'charlie@example.com'
    }
  });

  // Seed Documents owned by Alice
  const doc1 = await prisma.document.create({
    data: {
      id: 'doc_roadmap_001',
      title: 'Product Roadmap Q4',
      content: defaultDocContent('This document outlines the high-priority deliverables and roadmap goals for the upcoming quarter.'),
      ownerId: alice.id
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      id: 'doc_meeting_002',
      title: 'Weekly Sync Meeting Notes',
      content: defaultDocContent('Discussion notes regarding user feedback, UI/UX polish, and backend performance optimizations.'),
      ownerId: alice.id
    }
  });

  // Seed Document owned by Bob
  const doc3 = await prisma.document.create({
    data: {
      id: 'doc_backend_003',
      title: 'API Specification & DB Schema',
      content: defaultDocContent('Technical specifications for DocSpace REST endpoints and Prisma SQLite relationships.'),
      ownerId: bob.id
    }
  });

  // Seed Shares
  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: bob.id,
      permission: 'EDIT'
    }
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: charlie.id,
      permission: 'VIEW'
    }
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc3.id,
      userId: alice.id,
      permission: 'EDIT'
    }
  });

  console.log('Seeded Document Shares successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
