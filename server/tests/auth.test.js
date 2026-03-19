const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
    it('should prevent access to history without a token', async () => {
        const res = await request(app).get('/api/ai/history');
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe("No token provided");
    });
});