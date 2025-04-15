import createPoolForTenant from "../config/mysqlCon";

let _pools = {};

export const setPool = async (tenant = 'default') => {
  try {
    if (!_pools[tenant]) { // Fixed incorrect variable name from `pools` to `_pools`
      _pools[tenant] = await createPoolForTenant(tenant); // Added `await` for async function
    }
  } catch (error) {
    console.error('Error setting pool for tenant:', tenant, error);
  }
  return _pools[tenant];
};

export const getPool = async (tenant = 'default') => {
  if (!_pools[tenant]) { // Fixed incorrect variable name from `_pool` to `_pools`
    await setPool(tenant); // Ensure the pool is initialized if not already
  }
  return _pools[tenant];
};
