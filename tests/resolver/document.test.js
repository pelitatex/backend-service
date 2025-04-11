import { describe, it, expect, vi } from 'vitest';
import documentResolver from '../../graphql/resolvers/document';
import zlib from 'zlib';

vi.mock('zlib', () => ({
  default:{
    deflateSync: vi.fn(() => Buffer.from('compressed-data')),
    inflateSync: vi.fn(() => "Test Description"),
  }
}));

describe('documentResolver', () => {
  const mockPool = {
    query: vi.fn(),
  };

  const mockContext = {
    pool: mockPool,
  };

  

  describe('Query.document', () => {
    it('should return a document when found', async () => {
      const mockArgs = { id: 1 };
      const mockRows = [
        {
          id: 1,
          toko_id: 10,
          document_control_id: 20,
          tanggal: '2023-01-01',
          document_number_raw: 1,
          document_number: 'DOC-001',
          document_status: 'APPROVED',
          judul: 'Test Document',
          dari: 'Sender',
          kepada: 'Receiver',
          keterangan: zlib.deflateSync('Test Description').toString('base64'),
          penanggung_jawab: 'John Doe',
          username: 'johndoe',
          status_aktif: 1,
        },
      ];

      mockPool.query.mockResolvedValueOnce([mockRows]);

      const result = await documentResolver.Query.document(null, mockArgs, mockContext);

      expect(result).toEqual({
        id: 1,
        toko_id: 10,
        document_control_id: 20,
        tanggal: '2023-01-01',
        document_number_raw: 1,
        document_number: 'DOC-001',
        document_status: 'APPROVED',
        judul: 'Test Document',
        dari: 'Sender',
        kepada: 'Receiver',
        keterangan: 'Test Description',
        penanggung_jawab: 'John Doe',
        username: 'johndoe',
        status_aktif: 1,
      });
    });

    it('should throw an error when document is not found', async () => {
      const mockArgs = { id: 1 };
      mockPool.query.mockResolvedValueOnce([[]]);

      await expect(documentResolver.Query.document(null, mockArgs, mockContext)).rejects.toThrow('Document not found');
    });
  });

  describe('Mutation.addDocument', () => {
    it('should add a document and return the created document', async () => {
      const mockInput = {
        toko_id: 10,
        document_control_id: 20,
        tipe_dokumen: 'USER_GENERATE',
        kode_toko: 'TK',
        kode_dokumen: 'DOC',
        document_status: 'APPROVED',
        document_number: 'DOC-001',
        tanggal: '2023-01-01',
        judul: 'Test Document',
        dari: 'Sender',
        kepada: 'Receiver',
        keterangan: 'Test Description',
        penanggung_jawab: 'John Doe',
        username: 'johndoe',
        status_aktif: 1,
      };

      const mockArgs = { input: mockInput };
      const mockInsertResult = { insertId: 1, afffectedRows: 1 };
            
      mockPool.query.mockResolvedValueOnce([[]]); // start transaction
      mockPool.query.mockResolvedValueOnce([[]]); // lock table
      mockPool.query.mockResolvedValueOnce([[]]); // cek no document
      mockPool.query.mockResolvedValueOnce([mockInsertResult]); // insert document
      mockPool.query.mockResolvedValueOnce([[]]); // unclock table
      mockPool.query.mockResolvedValueOnce([[]]); // commit transaction
      mockPool.query.mockResolvedValueOnce([[]]); // mock logging

      const result = await documentResolver.Mutation.addDocument(null, mockArgs, mockContext);

      expect(result).toEqual({
        id: 1,
        ...mockInput,
      });
    });

    it('should throw an error if kode_toko is invalid', async () => {
      const mockInput = {
        kode_toko: 'INVALID',
        kode_dokumen: 'DOC',
        keterangan: 'Test Description',
      };

      const mockArgs = { input: mockInput };

      await expect(documentResolver.Mutation.addDocument(null, mockArgs, mockContext)).rejects.toThrow(
        'Kode Toko must be 2 characters'
      );
    });
  });
});
