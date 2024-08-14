import request from 'supertest';
import app from '../index';

const env = process.env.NODE_ENV || 'TEST';
const port_user = process.env[`PORT_${env}_USER`];
const port_gw = process.env[`PORT_${env}_GATEWAY`];


describe('Index API', () => {

    it('should respond with an error when a blank query is sent', async () => {
        const response = await request(app)
            .post('/graphql')
            .send({
                query: ' '
            });
        
        // Checking the response status code and error message
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Syntax Error: Unexpected <EOF>.');
    });

    // Test for valid request origin
    it('should allow requests from valid origin', async () => {
        const response = await request(app)
        .post('/graphql')
        .set('Origin', `http://localhost:${port_gw}`) // Set a valid origin
        .send({
            query: '{ hello }'
        });

        // Expect a successful response
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.hello).toBe('Hello, world');
    });

    // Test for invalid request origin
    it('should reject requests from invalid origin', async () => {
        const response = await request(app)
        .post('/graphql')
        .set('Origin', 'http://invalid-origin.com') // Set an invalid origin
        .send({
            query: '{ hello }'
        });

        // Expect a forbidden response
        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Forbidden: Invalid origin');
    });

    // Test for invalid IP address
    /* it('should reject requests from invalid IP address', async () => {
        const response = await request(app)
        .post('/graphql')
        .set('X-Forwarded-For', '192.168.100.1') // Mock an invalid IP
        .send({
            query: '{ hello }'
        });

        // Expect a forbidden response
        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Forbidden: Invalid origin');
    }); */
        
});

