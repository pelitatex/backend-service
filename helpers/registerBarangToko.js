import { sendToQueue } from "./producers";

const callbackConfirm = (err, ok) => {
    if (err) {
        console.error('Message nacked');
    } else {
        console.log('Message acked');
    }
}

export const initBarangMasterToko = async (tokoAlias, toko_id, barang_id, pool) => {

    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    try {
        
        await sendToQueue(`pairing_barang_master_toko`, Buffer.from(JSON.stringify({tokoAlias, toko_id, barang_id})), 0 , true, callbackConfirm);
        return;
        
    } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error get barangsku toko');
    }
    
}

