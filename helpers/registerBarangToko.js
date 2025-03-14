import { sendToQueue } from "./producers";

export const notifInitBarangToko = async (tokoAlias, toko_id, barang_id, pool) => {

    const pool = context.pool;
    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    try {
        
        await sendToQueue(`pairing_barang_master_toko`, Buffer.from(JSON.stringify({tokoAlias, toko_id, barang_id})), 0 , true );
        
    } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error get barangsku toko');
    }
    
}

