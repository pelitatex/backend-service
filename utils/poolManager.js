let _pool = null;

export const setPool = (newPool) => {
  _pool = newPool;
};

export const getPool = () => {
  if (!_pool) {
    throw new Error('Database connection pool has not been initialized.');
  }
  return _pool;
};
