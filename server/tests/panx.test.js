const request = require('supertest');
const { app } = require('../index');
const prisma = require('../src/config/prisma');

jest.mock('../src/config/prisma', () => ({
  panxPost: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  panxLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../src/middleware/authMiddleware', () => {
  return {
    authMiddleware: (req, res, next) => {
      req.user = { id: 'user123', role: 'CLIENT' };
      next();
    },
    isSuperUser: (req, res, next) => next(),
    isSuperUserOrAdmin: (req, res, next) => next()
  };
});

describe('PanX API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/panx/posts', () => {
    it('should return a list of PanX posts', async () => {
      prisma.panxPost.findMany.mockResolvedValue([
        { 
          id: 'post1', 
          content: 'Hello World', 
          authorId: 'user123',
          author: { id: 'user123', name: 'Author', avatarUrl: null },
          replies: [],
          _count: { likes: 0, reposts: 0, replies: 0 }
        }
      ]);
      prisma.panxPost.count.mockResolvedValue(1);

      const res = await request(app).get('/api/panx/posts');

      expect(res.statusCode).toEqual(200);
      expect(res.body.posts).toHaveLength(1);
      expect(res.body.posts[0]).toHaveProperty('content', 'Hello World');
    });
  });

  describe('POST /api/panx/posts', () => {
    it('should create a new PanX post', async () => {
      prisma.panxPost.create.mockResolvedValue({
        id: 'post1',
        content: 'New Post',
        authorId: 'user123'
      });

      const res = await request(app)
        .post('/api/panx/posts')
        .send({ content: 'New Post' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('content', 'New Post');
      expect(prisma.panxPost.create).toHaveBeenCalled();
    });
  });
});
