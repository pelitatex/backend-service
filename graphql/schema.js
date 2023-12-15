import { buildSchema } from 'graphql';

const schema = buildSchema(`#graphql
    type User {
        id: ID!
        username: String!
        posisi_id: Int!
        status_aktif: Boolean!
        time_start: String!
        time_end: String!
    }
    type SKUBarang {
        id: ID!
        nama_barang: String!
        sku_id: String!
        status_aktif: Boolean!
        satuan: Satuan!
    }
    type Satuan {
        id: ID!
        nama: String!
        status_aktif: Boolean!
    }
    type Barang {
        id: ID!
        nama_jual: String!
        status_aktif: Boolean!
    }
    type Warna {
        id: ID!
        warna_jual: String!
        status_aktif: Boolean!
    }
    type Customer {
        id: ID!
        nama: String
        status_aktif: Boolean!
    }
    type Supplier {
        id: ID!
        nama: String!
        status_aktif: Boolean!
    }    
    type Pembelian {
        id: ID!
        tanggal: String!
        no_faktur: String!
        supplier_id: Int!
    }
    type AuthPayload {
        token: String,
        timeout: String
    }
    type Query{
        users: [User]
        user(id: Int!): User
        skuBarangs: [SKUBarang]
        skuBarang(id: ID!): SKUBarang
        warnas: [Warna]
        warna(id: ID!): Warna
        satuan(id: ID!): Satuan
        satuans: [Satuan]
        customers: [Customer]
        customer(id: ID!): Customer
        suppliers: [Supplier]
        supplier(id: ID!): Supplier        
    }    
    type Mutation {
        login(username: String!, password: String!): AuthPayload
    }
`);



export default schema;