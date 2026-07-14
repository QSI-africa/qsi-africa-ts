const request = require('supertest');
const express = require('express');
const prisma = require('../src/config/prisma');
const ventureRoutes = require('../src/api/ventureRoutes');

// Mock auth middleware to bypass real authentication
jest.mock('../src/middleware/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    // If we want to simulate a specific user, we can pass it in headers
    const role = req.headers['x-mock-role'] || 'GENERAL_USER';
    req.user = { id: 'mock-user-id', role };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/ventures', ventureRoutes);

describe('Venture API Endpoints', () => {
  let ventureId;
  let engagementTypeId;
  let postId;
  let engagementId;

  beforeAll(async () => {
    // Clean up any existing data that might conflict
    await prisma.ventureEngagement.deleteMany({});
    await prisma.venturePost.deleteMany({});
    await prisma.ventureEngagementType.deleteMany({});
    await prisma.venture.deleteMany({});
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.ventureEngagement.deleteMany({});
    await prisma.venturePost.deleteMany({});
    await prisma.ventureEngagementType.deleteMany({});
    await prisma.venture.deleteMany({});
  });

  describe('Admin Operations - Ventures', () => {
    it('should prevent non-admins from creating a venture', async () => {
      const res = await request(app)
        .post('/api/ventures')
        .set('x-mock-role', 'GENERAL_USER')
        .send({
          name: 'Test Venture',
          shortDescription: 'Short desc',
        });
      expect(res.status).toBe(403);
    });

    it('should allow admin to create a venture', async () => {
      const res = await request(app)
        .post('/api/ventures')
        .set('x-mock-role', 'ADMIN')
        .send({
          name: 'Test Venture',
          shortDescription: 'Short desc',
          fullDescription: 'Long description',
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Venture');
      expect(res.body.slug).toBe('test-venture');
      ventureId = res.body.id;
    });

    it('should allow admin to update a venture', async () => {
      const res = await request(app)
        .put(`/api/ventures/${ventureId}`)
        .set('x-mock-role', 'ADMIN')
        .send({
          shortDescription: 'Updated desc',
        });
      expect(res.status).toBe(200);
      expect(res.body.shortDescription).toBe('Updated desc');
    });
  });

  describe('Public Operations - Ventures', () => {
    it('should list all active ventures', async () => {
      const res = await request(app).get('/api/ventures');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBe('Test Venture');
    });

    it('should get a venture by slug', async () => {
      const res = await request(app).get('/api/ventures/test-venture');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(ventureId);
      expect(res.body.name).toBe('Test Venture');
    });
  });

  describe('Admin Operations - Engagement Types & Posts', () => {
    it('should allow admin to add an engagement type', async () => {
      const res = await request(app)
        .post(`/api/ventures/${ventureId}/engagement-types`)
        .set('x-mock-role', 'ADMIN')
        .send({
          label: 'Invest Now',
          icon: 'TrendingUp',
          order: 1
        });
      expect(res.status).toBe(201);
      expect(res.body.label).toBe('Invest Now');
      engagementTypeId = res.body.id;
    });

    it('should allow admin to add a post', async () => {
      const res = await request(app)
        .post(`/api/ventures/${ventureId}/posts`)
        .set('x-mock-role', 'ADMIN')
        .send({
          content: 'Hello world! Our first update.',
        });
      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Hello world! Our first update.');
      postId = res.body.id;
    });
  });

  describe('User Operations - Engagement', () => {
    it('should allow user to submit an engagement', async () => {
      const res = await request(app)
        .post(`/api/ventures/${ventureId}/engage`)
        .set('x-mock-role', 'GENERAL_USER')
        .send({
          engagementType: 'Invest Now',
          contactName: 'John Doe',
          contactEmail: 'john@example.com',
          message: 'I am interested in investing.'
        });
      expect(res.status).toBe(201);
      expect(res.body.contactName).toBe('John Doe');
      expect(res.body.status).toBe('PENDING');
      engagementId = res.body.id;
    });

    it('should fail if missing required fields for engagement', async () => {
      const res = await request(app)
        .post(`/api/ventures/${ventureId}/engage`)
        .set('x-mock-role', 'GENERAL_USER')
        .send({
          engagementType: 'Invest Now',
          // missing contactName and contactEmail
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Admin Operations - Engagement Management', () => {
    it('should list all engagements for a venture', async () => {
      const res = await request(app)
        .get(`/api/ventures/${ventureId}/engagements`)
        .set('x-mock-role', 'ADMIN');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(engagementId);
    });

    it('should update engagement status', async () => {
      const res = await request(app)
        .patch(`/api/ventures/${ventureId}/engagements/${engagementId}`)
        .set('x-mock-role', 'ADMIN')
        .send({ status: 'REVIEWED' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('REVIEWED');
    });
  });

  describe('Admin Operations - Deletions', () => {
    it('should allow admin to delete a post', async () => {
      const res = await request(app)
        .delete(`/api/ventures/${ventureId}/posts/${postId}`)
        .set('x-mock-role', 'ADMIN');
      expect(res.status).toBe(204);
    });

    it('should allow admin to delete an engagement type', async () => {
      const res = await request(app)
        .delete(`/api/ventures/${ventureId}/engagement-types/${engagementTypeId}`)
        .set('x-mock-role', 'ADMIN');
      expect(res.status).toBe(204);
    });

    it('should allow admin to delete the venture', async () => {
      const res = await request(app)
        .delete(`/api/ventures/${ventureId}`)
        .set('x-mock-role', 'ADMIN');
      expect(res.status).toBe(204);
    });
  });
});
