import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import { publishExchange } from '../../helpers/producers.js';
import handleResolverError from "../handleResolverError.js";

const customerResolver = {
  Query:{
    customer: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_customer WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
      
    }),
    allCustomer: handleResolverError(async(_,args,context)=>{
      const pool = context.pool;
      
      const query = 'SELECT * FROM nd_customer';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addCustomer: handleResolverError(async (_, {input}, context) => {
      
      const pool = context.pool;
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
       
      const result = queryTransaction.insert(context, `nd_customer`, query, params);

      return result;
    }),
    updateCustomer: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      
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

      const result = await queryTransaction.update(context, `nd_customer`, id, query, params);

      const msg = {
        id: id,
        keyName: keyName,
        keyValue: keyValue
      };

      publishExchange('customer_legacy_events', 'customer.master_updated' , Buffer.from(JSON.stringify(msg)));


      return result;
    })
  }
}

export default customerResolver;