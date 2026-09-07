import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { parseTxtToTiptap, parseMarkdownToTiptap } from '../src/services/importService.js';

describe('DocSpace Authorization & Permissions Test Suite', () => {
  let alice, bob, charlie, david;
  let doc1;

  beforeEach(async () => {
    // Clean database before test suite
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed test users
    alice = await prisma.user.create({
      data: { id: 'usr_test_alice', name: 'Alice Test', email: 'alice@test.com' }
    });

    bob = await prisma.user.create({
      data: { id: 'usr_test_bob', name: 'Bob Test', email: 'bob@test.com' }
    });

    charlie = await prisma.user.create({
      data: { id: 'usr_test_charlie', name: 'Charlie Test', email: 'charlie@test.com' }
    });

    david = await prisma.user.create({
      data: { id: 'usr_test_david', name: 'David Test', email: 'david@test.com' }
    });

    // Seed test document owned by Alice
    doc1 = await prisma.document.create({
      data: {
        id: 'doc_test_001',
        title: 'Alice Confidential Specs',
        content: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial content' }] }]
        }),
        ownerId: alice.id
      }
    });

    // Share doc1 with Bob as EDIT
    await prisma.documentShare.create({
      data: {
        documentId: doc1.id,
        userId: bob.id,
        permission: 'EDIT'
      }
    });

    // Share doc1 with Charlie as VIEW
    await prisma.documentShare.create({
      data: {
        documentId: doc1.id,
        userId: charlie.id,
        permission: 'VIEW'
      }
    });
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('✓ owner can edit document', async () => {
    const res = await request(app)
      .patch(`/api/documents/${doc1.id}`)
      .set('X-User-Id', alice.id)
      .send({ title: 'Updated by Alice' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated by Alice');
    expect(res.body.isOwner).toBe(true);
  });

  it('✓ shared editor can edit document', async () => {
    const res = await request(app)
      .patch(`/api/documents/${doc1.id}`)
      .set('X-User-Id', bob.id)
      .send({ title: 'Updated by Bob' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated by Bob');
    expect(res.body.userPermission).toBe('EDIT');
  });

  it('✓ viewer cannot edit document (returns 403)', async () => {
    const res = await request(app)
      .patch(`/api/documents/${doc1.id}`)
      .set('X-User-Id', charlie.id)
      .send({ title: 'Attempted Update by Charlie' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('✓ non-shared user cannot access document (returns 403)', async () => {
    const res = await request(app)
      .get(`/api/documents/${doc1.id}`)
      .set('X-User-Id', david.id);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('✓ owner can share document', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc1.id}/shares`)
      .set('X-User-Id', alice.id)
      .send({ userId: david.id, permission: 'VIEW' });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(david.id);
    expect(res.body.permission).toBe('VIEW');
  });

  it('✓ non-owner cannot share document (returns 403)', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc1.id}/shares`)
      .set('X-User-Id', bob.id)
      .send({ userId: david.id, permission: 'VIEW' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('✓ imported text creates valid document structure', async () => {
    const txtResult = parseTxtToTiptap('Line 1 content\nLine 2 content', 'my_notes.txt');
    expect(txtResult.title).toBe('my_notes');
    expect(txtResult.tiptapJson.content.length).toBe(2);

    const mdResult = parseMarkdownToTiptap('# Project Plan\n\n- Task A\n- Task B', 'plan.md');
    expect(mdResult.title).toBe('Project Plan');
    expect(mdResult.tiptapJson.content[0].type).toBe('heading');
    expect(mdResult.tiptapJson.content[1].type).toBe('bulletList');
  });
});
