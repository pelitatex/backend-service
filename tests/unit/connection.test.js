import { describe, it, vi, expect, beforeEach } from "vitest";
import { getRabbitMQ } from "../../rabbitMQ/connection";
import * as amqplib from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../../config/loadEnv";

vi.mock("amqplib", () => ({
    connect: vi.fn(),
}));

vi.mock("../../config/loadEnv", () => ({
    RABBITMQ_URL: "localhost",
    RABBITMQ_USER: "my_user",
    RABBITMQ_PASSWORD: "my_password",
}));


describe("RabbitMQ Connection", () => {
    let mockConnection, mockChannel, mockConfirmChannel;

    beforeEach(() => {
        mockChannel = { /* Tambahkan fungsi yang diperlukan di channel */
            assertQueue: vi.fn(),
            sendToQueue: vi.fn(),
            consume: vi.fn(),
            ack: vi.fn(),
        };
        
        mockConfirmChannel = { /* Tambahkan fungsi yang diperlukan di channel */
            assertQueue: vi.fn(),
            sendToQueue: vi.fn(),
            consume: vi.fn(),
            ack: vi.fn(),
        };
        
        mockConnection = {
            createChannel: vi.fn().mockResolvedValue(mockChannel),
            createConfirmChannel: vi.fn().mockResolvedValue(mockConfirmChannel),
            close: vi.fn(), // Tambahkan fungsi close
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => callback(new Error("Mocked connection error")), 10);
                }

                if (event === "close") {
                    setTimeout(() => callback(new Error("Mocked connection close")), 10);
                }
            }),
        };

        amqplib.connect.mockResolvedValue(mockConnection);
    });

    it("should initialize and return RabbitMQ connection, channel, and confirmChannel", async () => {
        const result = await getRabbitMQ();

        expect(amqplib.connect).toHaveBeenCalled();
        expect(mockConnection.createChannel).toHaveBeenCalled();
        expect(mockConnection.createConfirmChannel).toHaveBeenCalled();
        expect(result).toEqual({
            channel: mockChannel,
            confirmChannel: mockConfirmChannel,
            connection: mockConnection, 
        });
    });

    it("should handle connection errors gracefully", async () => {
        amqplib.connect.mockRejectedValue(new Error("Connection failed"));

        await expect(getRabbitMQ()).rejects.toThrow("Connection failed");
    });
});

