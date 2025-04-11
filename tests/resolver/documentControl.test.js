import { describe, it, expect, vi } from 'vitest';
import documentControlResolver from '../../graphql/resolvers/documentControl.js';

describe('documentControlResolver', () => {
  const mockPool = {
    query: vi.fn(),
  };

  const mockContext = {
    pool: mockPool,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.documentControl', () => {
    it('should fetch a document control by ID', async () => {
      const mockArgs = { id: 1 };
      const mockResult = [{ id: 1, name: 'Test Document' }];
      mockPool.query.mockResolvedValueOnce([mockResult]);

      const result = await documentControlResolver.Query.documentControl(null, mockArgs, mockContext);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_document_control WHERE id = ?',
        [mockArgs.id]
      );
      expect(result).toEqual(mockResult[0]);
    });
  });

  describe('Mutation.addDocumentControl', () => {
    it('should add a new document control', async () => {
      const mockInput = {
        department_id: 1,
        tipe_dokumen: 'Type A',
        nama: 'Document A',
        kode: '01',
        keterangan: 'Test Description',
        status_aktif: 1,
      };
      const mockArgs = { input: mockInput };
      const mockDepartmentResult = [{ kode: 'DP' }];
      const mockLastCodeResult = [{ no_kode: '01', kode: 'DP01' }];
      const mockInsertResult = { insertId: 1 };

      mockPool.query
        .mockResolvedValueOnce([mockLastCodeResult]) // Last code query
        .mockResolvedValueOnce([mockDepartmentResult]) // Department query
        .mockResolvedValueOnce([mockInsertResult]); // Insert query

      const result = await documentControlResolver.Mutation.addDocumentControl(null, mockArgs, mockContext);

      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        id: 1,
        department_id: 1,
        tipe_dokumen: 'Type A',
        nama: 'DOCUMENT A',
        kode: 'DP02',
        keterangan: 'Test Description',
        status_aktif: 1,
      });
    });
  });

  describe('Mutation.updateDocumentControl', () => {
    it('should update an existing document control', async () => {
      const mockInput = {
        nama: 'Updated Document',
        keterangan: 'Updated Description',
        status_aktif: 1,
      };
      const mockArgs = { id: 1, input: mockInput };
      const mockUpdateResult = { affectedRows: 1 };

      mockPool.query.mockResolvedValueOnce([mockUpdateResult]);

      const result = await documentControlResolver.Mutation.updateDocumentControl(null, mockArgs, mockContext);

      expect(mockPool.query).toHaveBeenCalledWith(
        `UPDATE nd_document_control SET 
          nama = ?,
          keterangan = ?,
          status_aktif = ?
        WHERE id = ?`,
        ['UPDATED DOCUMENT', 'Updated Description', 1, 1]
      );
      expect(result).toEqual({
        id: 1,
        department_id: undefined,
        nama: 'UPDATED DOCUMENT',
        kode: undefined,
        keterangan: 'Updated Description',
        status_aktif: 1,
      });
    });
  });

  describe('Mutation.addDepartment', () => {
    it('should add a new department', async () => {
      const mockInput = {
        nama: 'Department A',
        kode: '01',
        status_aktif: 1,
      };
      const mockArgs = { input: mockInput };
      const mockInsertResult = { insertId: 1 };

      mockPool.query.mockResolvedValueOnce([mockInsertResult]);

      const result = await documentControlResolver.Mutation.addDepartment(null, mockArgs, mockContext);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO nd_department (nama, kode, status_aktif) VALUES (?, ?, ?)',
        ['DEPARTMENT A', '01', 1]
      );
      expect(result).toEqual({
        id: 1,
        nama: 'DEPARTMENT A',
        kode: '01',
        status_aktif: 1,
      });
    });
  });

  describe('Mutation.updateDepartment', () => {
    it('should update an existing department', async () => {
      const mockInput = {
        nama: 'Updated Department',
        kode: '02',
        status_aktif: 1,
      };
      const mockArgs = { id: 1, input: mockInput };
      const mockUpdateResult = { affectedRows: 1 };

      mockPool.query.mockResolvedValueOnce([mockUpdateResult]);

      const result = await documentControlResolver.Mutation.updateDepartment(null, mockArgs, mockContext);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE nd_department SET nama = ?, kode = ?, status_aktif = ? WHERE id = ?',
        ['UPDATED DEPARTMENT', '02', 1, 1]
      );
      expect(result).toEqual({
        id: 1,
        nama: 'UPDATED DEPARTMENT',
        kode: '02',
        status_aktif: 1,
      });
    });
  });
});
