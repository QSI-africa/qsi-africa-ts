const request = require('supertest');
const { app } = require('../index');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  engineerProfile: {
    create: jest.fn(),
  },
  tvChannel: {
    create: jest.fn(),
  }
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register-user', () => {
    it('should register a new general user successfully', async () => {
      // Mock that user doesn't exist yet
      prisma.user.findUnique.mockResolvedValue(null);
      
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'GENERAL_USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      // For create and update (update is called for refreshToken)
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register-user')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id', 'user123');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should return 400 if user already exists (P2002)', async () => {
      const error = new Error('Unique constraint failed');
      error.code = 'P2002';
      prisma.user.create.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/register-user')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email already exists.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return token', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'CLIENT',
        name: 'Test User',
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    it('should return 401 for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
