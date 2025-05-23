import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignBarangToko, assignAllBarangSKUToko, assignSingleBarangSKUToko, assignSelectedBarangSKUToko } from '../../rabbitMQ/barangSKUToko_producers.js';

const mockConfirmChannel = {
    createConfirmChannel: vi.fn(),
    assertQueue: vi.fn(),
    consume: vi.fn(),
    sendToQueue: vi.fn(),
};

const mockChannel = {
    createChannel: vi.fn(),
    assertQueue: vi.fn(),
    consume: vi.fn(),
    sendToQueue: vi.fn(),
};

const mockPool = {
    query: vi.fn(),
};

vi.mock('../../rabbitMQ/connection.js', () => ({
    getRabbitMQ : vi.fn(() =>
        Promise.resolve({
            connection: {
                createChannel: vi.fn(() => mockChannel),
                createConfirmChannel: vi.fn(() => mockChannel),
            },
            channel: mockChannel,
            confirmChannel: mockConfirmChannel,
        })
    )
}));

import { getRabbitMQ } from '../../rabbitMQ/connection.js';


beforeEach(() => {
    vi.clearAllMocks();
});

describe('assignBarangToko', () => {
    it('should throw an error if no connection is available', async () => {

        getRabbitMQ.mockImplementationOnce(() => {
            return Promise.resolve({ connection: undefined });
        });

        await expect(assignBarangToko({ pool: mockPool, toko_id: 1, barang_id: 1, company: 'test' }))
            .rejects.toThrow('No Connection');
    });

    it('should throw an error if no pool is provided', async () => {
        await expect(assignBarangToko({ toko_id: 1, barang_id: 1, company: 'test' }))
            .rejects.toThrow('Database pool not available in context.');
    });

    it('should send a message to the queue', async () => {
        mockPool.query.mockResolvedValueOnce([[{ nama_jual: 'Test Barang', satuan_id: 1 }]]);
        mockChannel.assertQueue.mockResolvedValue({ queue: 'test_queue' });
        mockChannel.consume.mockImplementation((queue, callback) => {
            const msg = {
                content: Buffer.from(JSON.stringify({ status: 'success', message: 'Success' })),
                properties: { correlationId: 'test-correlation-id' },
            };
            callback(msg);
        });

        await assignBarangToko({ pool: mockPool, toko_id: 1, barang_id: 1, company: 'test' });

        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            'add_barang_master_toko',
            expect.any(Buffer),
            expect.objectContaining({ correlationId: expect.any(String), replyTo: 'test_queue' }),
            expect.any(Function)
        );
    });
});

describe('assignAllBarangSKUToko', () => {
    it('should process all SKUs in batches', async () => {
        mockPool.query
            .mockResolvedValueOnce([[{ id: 1, sku_id: '010701-37410fd2-0a47', warna_jual_master: 'Red' }]])
            .mockResolvedValueOnce([[]]);

        mockChannel.assertQueue.mockResolvedValue({ queue: 'test_queue' });
        mockChannel.consume.mockImplementation((queue, callback) => {
            const msg = {
                content: Buffer.from(JSON.stringify({ status: 'success', affectedRows: 1 })),
                properties: { correlationId: 'test-correlation-id' },
            };
            callback(msg);
        });

        await assignAllBarangSKUToko('test', 1, 1, mockPool);

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);
    });

    it('throw an error kalau data hasil query tidak lengkap', async () => {
        mockPool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        await expect(assignAllBarangSKUToko('test', 1, 1, mockPool)).rejects.toThrow('SKU data tidak lengkap'); 

    });
});

describe('assignSingleBarangSKUToko', () => {
    it('menambah single barang toko tetapi belum di assign ke toko manapun ', async () => {
        mockPool.query
            .mockResolvedValueOnce([{ barang_id: 1, warna_id: 1 }])
            .mockResolvedValueOnce([[]]);

        await assignSingleBarangSKUToko(1, mockPool);

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(0);
    });

    it('menambah single barang toko dan assign ke toko yang terdaftar ', async () => {
        mockPool.query
            .mockResolvedValueOnce([{ barang_id: 1, warna_id: 1 }])
            .mockResolvedValueOnce([[{toko_id: 1, company: 'test'}]]);

        mockChannel.assertQueue.mockResolvedValue({ queue: 'test_queue' });
        mockChannel.consume.mockImplementation((queue, callback) => {
            const msg = {
                content: Buffer.from(JSON.stringify({ status: 'success' })),
                properties: { correlationId: 'test-correlation-id' },
            };
            callback(msg);
        });

        await assignSingleBarangSKUToko(1, mockPool);

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);
    });

});

describe('assignSelectedBarangSKUToko', () => {
    it('menambah selected atau multiple barang sku kemudian assign ke toko tetapi belum affiliate ke toko manapun ', async () => {
        mockPool.query
            .mockResolvedValueOnce([[{ barang_id: 1, warna_id: 1 }]])
            .mockResolvedValueOnce([[]]);

        await assignSelectedBarangSKUToko([1], mockPool);

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(0);
    });

    it('menambah selected atau multiple barang toko dan assign ke toko yang terdaftar ', async () => {
        mockPool.query
            .mockResolvedValueOnce([[{ barang_id: 1, warna_id: 1 }, { barang_id: 1, warna_id: 2 }]])
            .mockResolvedValueOnce([[{toko_id: 1, company: 'test'}]]);

        mockChannel.assertQueue.mockResolvedValue({ queue: 'test_queue' });
        mockChannel.consume.mockImplementation((queue, callback) => {
            const msg = {
                content: Buffer.from(JSON.stringify({ status: 'success' })),
                properties: { correlationId: 'test-correlation-id' },
            };
            callback(msg);
        });

        await assignSingleBarangSKUToko([1], mockPool);

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);
    });

});
