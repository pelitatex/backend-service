import createPoolForTenant from "../config/mysqlCon.js";

let _pools = {};

export const setPool = async(tenant = 'default') => {
  try {
    if(!_pools[tenant]) {
      console.log('Creating new pool for tenant:', tenant);
      _pools[tenant] = createPoolForTenant(tenant);
    }
    
  } catch (error) {
    console.error('Error setting pool for tenant', error);
  }
  return _pools[tenant];
};

export const getPool = (tenant = 'default') => {
  if (!_pools[tenant]) {
    throw new Error('Database connection pool has not been initialized.');
  }
  return _pools[tenant];
};

export const closeAllPools = async () => {
  console.log('Closing database connection pools...');
  try {
    for (const tenant in _pools) {
      if (_pools[tenant]) {
        await _pools[tenant].end();
        console.log(`Connection pool for ${tenant} closed.`);
      }
    }
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }
}
