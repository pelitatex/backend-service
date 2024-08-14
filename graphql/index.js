import { makeExecutableSchema } from 'graphql-tools';
import _ from "lodash";
import typeDefs from "./schema/index.js";

import userResolver from "./resolvers/user.js";
import skuBarangResolver from "./resolvers/skuBarang.js";
import warnaResolver from "./resolvers/warna.js";
import supplierResolver from "./resolvers/supplier.js";
import customerResolver from "./resolvers/customer.js";
import satuanResolver from './resolvers/satuan.js';
import tokoResolver from './resolvers/toko.js';
import helloResolver from './resolvers/hello.js';
import skuComponentResolver from './resolvers/skuComponent.js';


const resolvers = _.merge(
    helloResolver,
    userResolver,
    skuBarangResolver,
    warnaResolver,
    supplierResolver,
    customerResolver,
    satuanResolver,
    tokoResolver,
    skuComponentResolver
);

// console.log('resolver', resolvers);

// const typeDefs = schema;

const eSchema = makeExecutableSchema({typeDefs, resolvers});

export default eSchema;