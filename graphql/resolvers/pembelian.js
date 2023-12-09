// import db from "../../config/db.js";

// const getPembelian = {
//     pembelian: async(args, req)=>{
//         try {
//             const query = `SELECT * FROM nd_pembelian WHERE id = ?`;
//             const values = [args.id];
//             return new Promise((resolve, reject) => {
//                 db.query(query, values, (err, results) => {
//                   if (err) {
//                     console.error('Error executing MySQL query: ' + err);
//                     reject('Error fetching pembelian data');
//                   } else {
//                     resolve(results[0]);
//                   }
//                 });
//             });
//         } catch (error) {
            
//         }
//     },
//     pembelians: async(parent, args)=>{
//       const {first, after} = args;
//       let startIndex = 0;
//       let limit = 0;

//       if (first) {
//         limit = first;
//       }
      
//       if (after) {
//         // Find the index of the item after the specified cursor
//         startIndex = users.findIndex((user) => user.id === after);
//         if (startIndex === -1) {
//           return [];
//         }
//         startIndex++; // Start from the item after the specified cursor
//       }


//         try {
//             const query = `SELECT * FROM nd_pembelian`;
//             return new Promise((resolve, reject) => {
//                 db.query(query, (err, results) => {
//                   if (err) {
//                     console.error('Error executing MySQL query: ' + err);
//                     reject('Error fetching pembelian data');
//                   } else {
//                     resolve(results);
//                   }
//                 });
//             });
//         } catch (error) {
            
//         }
//     }
// }

// export default getPembelian;

export default null;