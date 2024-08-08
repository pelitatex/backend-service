import { buildSchema } from 'graphql';

const schema = buildSchema(`#graphql
    type User {
        id: ID!
        username: String!
        password: String!
        posisi_id: Int!
        time_start: String!
        time_end: String!
        status_aktif: Boolean!
    }
    type SKUComponent {
        id: ID!
        nama: String!
        kode: String!
        keterangan: String
        status_aktif: Boolean!
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
        user(id: Int!): User
        allUser: [User]
        skuBahan(id: ID!):SKUComponent
        allSkuBahan: [SKUComponent]
        skuFitur(id: ID!): SKUComponent
        allSkuFitur: [SKUComponent]
        skuGrade(id: ID!): SKUComponent
        allSkuGrade: [SKUComponent]
        skuTipe(id: ID!): SKUComponent
        allSkuTipe: [SKUComponent]
        skuBarang(id: ID!): SKUBarang
        allSkuBarang: [SKUBarang]
        warna(id: ID!): Warna
        allWarna: [Warna]
        satuan(id: ID!): Satuan
        allSatuan: [Satuan]
        allCustomer: [Customer]
        customer(id: ID!): Customer
        supplier(id: ID!): Supplier        
        allSupplier: [Supplier]
    }
    type Mutation {
        login(username: String!, password: String!): AuthPayload
        addUser(input: AddUserInput!): User
        updateUser(id: ID!, input: UpdateUserInput!): User
    }
    input UpdateUserInput {
        username: String!
        password: String!
        posisi_id: Int!
        time_start: String
        time_end: String
        status_aktif: Boolean!
    }
    input AddUserInput {
        username: String!
        password: String!
        posisi_id: Int!
        time_start: String
        time_end: String
        status_aktif: Boolean!
    }
`);



export default schema;