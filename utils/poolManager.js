import createPoolForTenant from "../config/mysqlCon.js";

let _pools = {};



export const setPool = async(tenant = 'default') => {
  try {
    if(!_pools[tenant]) {
      _pools[tenant] = createPoolForTenant(tenant);
    }
    
  } catch (error) {
    console.error('Error setting pool for tenant', error);
  }
  return _pools[tenant];
};

export const getPool = (tenant = 'default') => {
  if (!_pool[tenant]) {
    throw new Error('Database connection pool has not been initialized.');
  }
  return _pool[tenant];
};
