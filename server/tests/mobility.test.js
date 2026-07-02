const request = require('supertest');
const { app } = require('../index');
const prisma = require('../src/config/prisma');

jest.mock('../src/config/prisma', () => ({
  siteVisitRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  projectShowcase: {
    findUnique: jest.fn(),
  }
}));

jest.mock('../src/middleware/authMiddleware', () => {
  return {
    authMiddleware: (req, res, next) => {
      req.user = { id: 'client123', role: 'CLIENT' };
      next();
    },
    isSuperUser: (req, res, next) => next(),
    isSuperUserOrAdmin: (req, res, next) => next()
  };
});

describe('Mobility API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('POST /api/mobility/site-visit', () => {
    it('should create a site visit request successfully', async () => {
      prisma.projectShowcase.findUnique.mockResolvedValue({ 
        id: 'proj1',
        engineerProfile: { userId: 'engineer1' }
      });
      prisma.siteVisitRequest.create.mockResolvedValue({
        id: 'visit1',
        projectId: 'proj1',
        userId: 'client123',
        status: 'PENDING'
      });

      const res = await request(app)
        .post('/api/mobility/site-visit')
        .send({ projectId: 'proj1', message: 'I want to visit' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 'visit1');
      expect(res.body).toHaveProperty('status', 'PENDING');
    });

    it('should return 400 if projectId is missing', async () => {
      const res = await request(app)
        .post('/api/mobility/site-visit')
        .send({ message: 'I want to visit' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Project ID is required.');
    });
  });
});
