import _ from "lodash";

import userResolver from "./user.js";
import skuBarangResolver from "./skuBarang.js";
import warnaResolver from "./warna.js";
import supplierResolver from "./supplier.js";
import customerResolver from "./customer.js";

const resolvers = _.merge(
    {},
    userResolver,
    skuBarangResolver,
    warnaResolver,
    supplierResolver,
    customerResolver,
    userResolver
);

console.log('resolver', resolvers);

export default resolvers;