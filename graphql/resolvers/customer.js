import queryTransaction from "../../helpers/queryTransaction.js";
import { publishExchange } from '../../helpers/producers.js';

const customerResolver = {
  Query:{
    customer: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_customer WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    },
    allCustomer: async(_,args,context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
          const query = 'SELECT * FROM nd_customer';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    }
  },
  Mutation: {
    addCustomer: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        throw new Error('Database pool not available in context.');
      }
      try {

        let columns = [];
        let params = [];
        let q = [];
        for (const [key, value] of Object.entries(input)) {
          columns.push(key);
          params.push(value);
          q.push('?');
        }
        
        const query = `INSERT INTO nd_customer (${columns.join(', ')}) 
        VALUES ( ${q.join(', ')} )`;
         
        const result = queryTransaction.insert(pool, `nd_customer`, query, params);

        return result;
      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Add Customer');
      }
    },
    updateCustomer: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        
        let columns = [];
        let params = [];
        let q = [];
        let keyName = input.npwp ? 'npwp' : 'nik';
        let keyValue = input.npwp ? input.npwp : input.nik;
        for (const [key, value] of Object.entries(input)) {
          columns.push(`${key} = ?`);
          params.push(value);
        }

        params.push(id);

        const query = `UPDATE nd_customer SET 
        ${columns.join(', ')}
        WHERE id = ?`;

        const result = await queryTransaction.update(pool, `nd_customer`, id, query, params);

        const msg = {
          id: id,
          keyName: keyName,
          keyValue: keyValue
        };

        publishExchange('customer_legacy_events', 'customer.master_updated' , Buffer.from(JSON.stringify(msg)));


        return result;

      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Update Customer');
      }
    }
  }
}

export default customerResolver;