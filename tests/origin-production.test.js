import request from 'supertest';
import app from '../index.js';

describe('Origin and IP Tests', () => {
    test('should allow request from trusted origin', async () => {
        const response = await request(app)
            .get('/hello')
            .set('Origin', 'https://trusted-origin.com');
        
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Request allowed');
    });

    test('should block request from untrusted origin', async () => {
        const response = await request(app)
            .get('/hello')
            .set('Origin', 'https://untrusted-origin.com');
        
            console.info('response', response.text, response.body);

        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Request blocked');
    });

    test('should allow request from allowed IP', async () => {
        const response = await request(app)
            .get('/hello')
            .set('X-Forwarded-For', '202.138.247.174');
        
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Request allowed');
    });

    test('should block request from disallowed IP', async () => {
        const response = await request(app)
            .get('/hello')
            .set('X-Forwarded-For', '987.654.321.0');
        
        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Request blocked');
    });
});