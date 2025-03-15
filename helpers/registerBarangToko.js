import { sendToQueue } from "./producers";

export const initBarangMasterToko = async (tokoAlias, toko_id, barang_id, pool) => {

    if (!pool) {
        throw new Error('Database pool not available in context.');
    }
    try {
        
        await sendToQueue(`pairing_barang_master_toko`, Buffer.from(JSON.stringify({tokoAlias, toko_id, barang_id})), 0 , true, function(err, ok) {
            if (err) {
                console.error(err);
            } else {
                assignBarangSKUToko(tokoAlias, toko_id, barang_id, pool);
            }

        });
        return;
        
    } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error get barangsku toko');
    }
    
}

export const assignBarangSKUToko = async (tokoAlias, toko_id, barang_id, pool) => {
    if (!pool) {
        throw new Error('Database pool not available in context.');
    }
    try {
        const query = 'SELECT * FROM nd_barang_sku WHERE barang_id = ?';
        const [rows] = await pool.query(query, [barang_id]);
        if(rows.length === 0){
            console.log('Barang tidak ada sku');
            return;
        }
        const msg = {company:tokoAlias, ...rows[0]};
        await sendToQueue(`pairing_barang_sku_toko`, Buffer.from(JSON.stringify(msg)), 0 , true, function(err, ok) {
            if (err) {
                console.error(err);
            } else {
                console.log('Message confirmed');
            }
        });
    }catch{
        console.error('massage nacked barang sku');
        throw new Error('Internal Server Error set barangsku toko');
    }
}
