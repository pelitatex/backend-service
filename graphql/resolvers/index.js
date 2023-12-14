import { makeExecutableSchema } from 'graphql-tools';
import _ from "lodash";
import schema from "../schema.js";

import userResolver from "./user.js";
import skuBarangResolver from "./skuBarang.js";
import warnaResolver from "./warna.js";
import supplierResolver from "./supplier.js";
import customerResolver from "./customer.js";
import satuanResolver from './satuan.js';

const resolvers = _.merge(
    userResolver,
    skuBarangResolver,
    warnaResolver,
    supplierResolver,
    customerResolver,
    satuanResolver
);

console.log('resolver', resolvers);

const typeDefs = schema;

const eSchema = makeExecutableSchema({typeDefs, resolvers});

export default eSchema;