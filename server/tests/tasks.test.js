const request = require('supertest');
const { app } = require('../index');
const prisma = require('../src/config/prisma');

jest.mock('../src/config/prisma', () => ({
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  }
}));

// Mock authentication middleware to always inject a Super User
jest.mock('../src/middleware/authMiddleware', () => {
  return {
    authMiddleware: (req, res, next) => {
      req.user = { id: 'admin123', role: 'SUPER_USER' };
      next();
    },
    isSuperUser: (req, res, next) => {
      next();
    },
    isSuperUserOrAdmin: (req, res, next) => {
      next();
    }
  };
});

describe('Tasks API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/tasks', () => {
    it('should return a list of tasks', async () => {
      const mockTasks = [
        { id: 'task1', title: 'Test Task 1', status: 'PENDING_ASSIGNMENT' },
        { id: 'task2', title: 'Test Task 2', status: 'PENDING_DESIGN' }
      ];
      prisma.task.findMany.mockResolvedValue(mockTasks);

      const res = await request(app).get('/api/admin/tasks');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('id', 'task1');
    });
  });

  describe.skip('PUT /api/admin/tasks/:taskId/assign', () => {
    it('should assign a task to a user', async () => {
      // Mock existing task
      prisma.task.findUnique.mockResolvedValue({
        id: 'task1',
        title: 'Test Task',
        status: 'PENDING_ASSIGNMENT'
      });
      // Mock assignee exists
      prisma.user.findUnique.mockResolvedValue({
        id: 'engineer123',
        name: 'Engineer Name'
      });
      // Mock updated task
      prisma.task.update.mockResolvedValue({
        id: 'task1',
        status: 'PENDING_DESIGN',
        assignedToId: 'engineer123'
      });

      const res = await request(app)
        .put('/api/admin/tasks/task1/assign')
        .send({ assignedToId: 'engineer123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.task).toHaveProperty('assignedToId', 'engineer123');
      expect(res.body.task).toHaveProperty('status', 'PENDING_DESIGN');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should return 404 if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/admin/tasks/nonexistent/assign')
        .send({ assignedToId: 'engineer123' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Task not found.');
    });
  });
});
