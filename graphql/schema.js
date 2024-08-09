import { buildSchema } from 'graphql';

const schema = buildSchema(`#graphql
    type User {
        id: ID!
        username: String
        password: String
        posisi_id: Int
        time_start: String
        time_end: String
        status_aktif: Boolean!
        has_account: Boolean!
        nama: String!
        alamat:String
        telepon:String
        jenis_kelamin:String
        kota_lahir:String
        tgl_lahir:String
        status_perkawinan:String
        jumlah_anak:Int
        agama:String
        nik:String
        npwp:String
        profile_picture:String
        ktp_picture:String
        npwp_picture:String
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
        warna_beli: String
        warna_jual: String!
        kode_warna: String
        status_aktif: Boolean!
    }
    type Customer {
        id: ID!
        tipe_company: String!
        nama: String!
        alias: String
        alamat: String
        blok: String
        no: String
        rt: String
        rw: String
        kecamatan: String
        kelurahan: String
        kota: String
        provinsi: String
        kode_pos: String
        npwp: String
        nik: String
        email: String
        contact_person: String
        tempo_kredit: Int
        warning_kredit: Int
        limit_warning_type: String
        limit_amount: Int
        limit_atas: Int
        limit_warning_amount: Int
        img_link: String
        npwp_link: String
        ktp_link: String
        medsos_link: String
        locked_status: Boolean
        user_id: Int!
        created_at: String
        updated_at: String
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
    type Toko{
        id: ID!
        nama: String!
        alamat: String
        telepon: String
        email: String
        kota: String
        kode_pos: String
        npwp: String
        kode_toko: String!
        status_aktif: Boolean!
        nama_domain: String
        email_pajak: String
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
        toko(id: ID!): Toko
        allToko: [Toko]
    }
    type Mutation {
        login(username: String!, password: String!): AuthPayload
        addUser(input: AddUserInput!): User
        updateUser(id: ID!, input: UpdateUserInput!): User
        addWarna(input: AddWarnaInput!): Warna
        updateWarna(id: ID!, input: UpdateWarnaInput!): Warna
        addToko(input: AddTokoInput!): Toko
        updateToko(id: ID!, input: UpdateTokoInput!): Toko
    }
    input UpdateUserInput {
        username: String
        password: String
        posisi_id: Int
        time_start: String
        time_end: String
        status_aktif: Boolean!
        has_account: Boolean!
        nama: String!
        alamat: String
        telepon: String
        jenis_kelamin: String
        kota_lahir: String
        tgl_lahir: String
        status_perkawinan: String
        jumlah_anak: Int
        agama: String
        nik: String
        npwp: String
        profile_picture:String
        ktp_picture:String
        npwp_picture:String
    }
    input AddUserInput {
        username: String
        password: String
        posisi_id: Int
        time_start: String
        time_end: String
        status_aktif: Boolean!
        has_account: Boolean!
        nama: String!
        alamat: String
        telepon: String
        jenis_kelamin: String
        kota_lahir: String
        tgl_lahir: String
        status_perkawinan: String
        jumlah_anak: Int
        agama: String
        nik: String
        npwp: String
        profile_picture:String
        ktp_picture:String
        npwp_picture:String
    }
    input AddWarnaInput {
        warna_beli: String
        warna_jual: String!
        kode_warna: String
        status_aktif: Boolean!
    }

    input UpdateWarnaInput {
        warna_beli: String
        warna_jual: String!
        kode_warna: String
        status_aktif: Boolean
    }
    input AddTokoInput {
        nama: String!
        alamat: String
        telepon: String
        email: String
        kota: String
        kode_pos: String
        npwp: String
        kode_toko: String!
        status_aktif: Boolean!
        nama_domain: String
        email_pajak: String
    }
    input UpdateTokoInput {
        nama: String!
        alamat: String
        telepon: String
        email: String
        kota: String
        kode_pos: String
        npwp: String
        kode_toko: String!
        status_aktif: Boolean!
        nama_domain: String
        email_pajak: String
    }


`);



export default schema;