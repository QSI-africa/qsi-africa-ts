const request = require('supertest');
const { app, server } = require('../index');
const prisma = require('../src/config/prisma');

jest.mock('../src/services/emailService', () => ({
  sendNewRideRequestEmail: jest.fn().mockResolvedValue(true),
  sendPriceUpdateEmail: jest.fn().mockResolvedValue(true),
  sendRideRequestBroadcastEmail: jest.fn().mockResolvedValue(true),
  sendRideAssignedEmail: jest.fn().mockResolvedValue(true),
  sendDriverApprovalEmail: jest.fn().mockResolvedValue(true),
  sendRideStatusUpdateEmail: jest.fn().mockResolvedValue(true),
  sendFleetDriverRegistrationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Fleet Management E2E Flow', () => {
  let driverToken, adminToken, clientToken;
  let driverId, adminId, clientId;
  let requestId;
  let driverEmail = `driver_${Date.now()}@test.com`;
  let adminEmail = `superadmin_${Date.now()}@test.com`;
  let clientEmail = `client_${Date.now()}@test.com`;

  beforeAll(async () => {
    // 1. Create a Super Admin
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'dummyhash',
        name: 'Super Admin',
        role: 'SUPER_USER'
      }
    });

    // 2. Create a normal client
    await prisma.user.create({
      data: {
        email: clientEmail,
        password: 'dummyhash',
        name: 'Normal Client',
        role: 'GENERAL_USER'
      }
    });

    // Generate tokens (simulate login or just use jwt if we want, but since authRoutes expects password, 
    // it's easier to mock the jwt directly. Let's just generate tokens directly using jsonwebtoken)
    const jwt = require('jsonwebtoken');
    const generateToken = async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      return { token: jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' }), id: user.id };
    };

    const adminAuth = await generateToken(adminEmail);
    adminToken = adminAuth.token;
    adminId = adminAuth.id;

    const clientAuth = await generateToken(clientEmail);
    clientToken = clientAuth.token;
    clientId = clientAuth.id;
  });

  afterAll(async () => {
    // Cleanup DB (Delete in reverse order of dependencies)
    await prisma.fleetRideRequest.deleteMany({
      where: { clientId }
    });
    if (driverId) {
      await prisma.fleetVehicle.deleteMany({
        where: { driverId }
      });
    }
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, clientEmail, driverEmail] }
      }
    });
    server.close();
  });

  it('1. Should register a fleet driver', async () => {
    const res = await request(app)
      .post('/api/auth/register-fleet-driver')
      .send({
        name: 'Test Driver',
        email: driverEmail,
        password: 'password123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Black',
        licensePlate: 'ABC-1234',
        vehicleType: 'SEDAN'
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('FLEET_DRIVER');
    
    driverToken = res.body.token;
    driverId = res.body.user.id;
  });

  it('2. Driver should initially be unapproved', async () => {
    const res = await request(app)
      .get('/api/fleet/my-vehicle')
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isApproved).toBe(false);
  });

  it('3. Admin should approve the driver', async () => {
    const res = await request(app)
      .patch(`/api/admin/fleet/drivers/${driverId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: true });

    expect(res.status).toBe(200);
    expect(res.body.isApproved).toBe(true);
  });

  it('4. Client should submit a ride request', async () => {
    const res = await request(app)
      .post('/api/mobility/fleet-request')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
        rideDate: new Date().toISOString(),
        rideTime: '10:00',
        offerPrice: 50,
        details: 'Need a trunk for luggage'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    requestId = res.body.id;
  });

  it('5. Admin should assign driver and update price', async () => {
    // Process request
    let res = await request(app)
      .patch(`/api/admin/fleet/requests/${requestId}/process`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PROCESSING');

    // Update price and assign
    res = await request(app)
      .patch(`/api/admin/fleet/requests/${requestId}/update-price`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPrice: 60, adminNotes: 'Confirmed price' });
    expect(res.status).toBe(200);
    expect(res.body.finalPrice).toBe('60');

    res = await request(app)
      .post(`/api/admin/fleet/requests/${requestId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driverId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.assignedDriverId).toBe(driverId);
  });

  it('6. Driver should update status to IN_PROGRESS then COMPLETED', async () => {
    // Start ride
    let res = await request(app)
      .patch(`/api/fleet/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'IN_PROGRESS' });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');

    // Complete ride
    res = await request(app)
      .patch(`/api/fleet/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('7. Client should see their completed ride in history', async () => {
    const res = await request(app)
      .get('/api/mobility/my-fleet-requests')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const ride = res.body.find(r => r.id === requestId);
    expect(ride.status).toBe('COMPLETED');
    expect(ride.finalPrice).toBe('60');
  });
});
