import request from 'supertest';
import apiGateway from '../api-gateway.js';
import {jest} from '@jest/globals'
import dotenv from 'dotenv';

dotenv.config();
const env = process.env.NODE_ENV || 'TEST';
const port_user = process.env[`PORT_${env}_USER`];

// Mock the http-proxy-middleware module
jest.mock('http-proxy-middleware', () => ({
    createProxyMiddleware: jest.fn().mockImplementation(() => jest.fn()),
}));

// Mock the forwardToMicroservice object
const forwardToMicroservice = {
    microservice1: `http://localhost:${port_user}`,
    // Add more microservices as needed
};

describe('Test /graphql endpoint', () => {
    
    test('It should require tenant header', async () => {
        const response = await request(apiGateway)
            .get('/graphql');
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Missing tenant in headers');
    });

    test('It should respond with 401 Unauthorized when no token is provided', async () => {
        const response = await request(apiGateway).get('/master');
        expect(response.statusCode).toBe(401);
    });

    test('It should respond with 401 Unauthorized when an invalid token is provided', async () => {
        const response = await request(apiGateway)
            .get('/master')
            .set('Authorization', 'Bearer invalid_token');
        expect(response.statusCode).toBe(401);
    });


    // Add more tests for successful requests, ensuring the proxy middleware works as expected
});