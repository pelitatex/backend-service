import _ from "lodash";

import getUser from "./user.js";
import getBarang from "./barang.js";
import getWarna from "./warna.js";
import getSupplier from "./supplier.js";
import getCustomer from "./customer.js";
import getPembelian from "./pembelian.js";

const resolvers = _.merge(
    getUser,
    getBarang,
    getWarna,
    getSupplier,
    getCustomer,
    getPembelian
    );

console.log('resolver', resolvers);

export default resolvers;