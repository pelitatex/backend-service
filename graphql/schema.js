import { buildSchema } from 'graphql';

const schema = buildSchema(`#graphql
    type User {
        id: ID!
        username: String!,
        posisi_id: Int!,
        status_aktif: Boolean!,
        time_start: String!,
        time_end: String!,
    }
    type Barang {
        id: ID!
        nama_jual: String!
    }
    type Warna {
        id: ID!
        warna_jual: String!
    }
    type Customer {
        id: ID!
        nama: String
    }
    type Supplier {
        id: ID!
        nama: String!
    }    
    type Pembelian {
        id: ID!
        tanggal: String!
        no_faktur: String!
        supplier_id: Int!
    }
    type Query{
        users: [User]
        user(id: Int!): User
        barangs: [Barang]
        barang(id: ID!): Barang
        warnas: [Warna]
        warna(id: ID!): Warna
        customers: [Customer]
        customer(id: ID!): Customer
        suppliers: [Supplier]
        supplier(id: ID!): Supplier        
        pembelians(first: Int, after: String): [Pembelian]
        pembelian(id: ID!): Pembelian
    }
    type AuthPayload {
        token: String
    }
    type Mutation {
        login(username: String!, password: String!): AuthPayload
    }
`);



export default schema;