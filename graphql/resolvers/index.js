import _ from "lodash";

import userResolver from "./user.js";
import skuBarangResolver from "./skuBarang.js";
import warnaResolver from "./warna.js";
import supplierResolver from "./supplier.js";
import customerResolver from "./customer.js";

const resolvers = _.merge(
    userResolver.Query,
    skuBarangResolver.Query,
    skuBarangResolver.SKUBarang,
    warnaResolver.Query,
    supplierResolver.Query,
    customerResolver.Query,
    userResolver.Mutation
);

console.log('resolver', resolvers);

export default resolvers;