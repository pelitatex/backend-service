import {FRONTEND_URL, PORT_GATEWAY, ENVIRONMENT, ALLOWED_IPS, NODE2_URL, TOKENSECRET} from "./config/loadEnv.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import axios from 'axios';
import { expressjwt } from "express-jwt";
import { graphqlHTTP } from "express-graphql";
import helmet from "helmet";
import multer from 'multer';

// built in modules
import queryTransaction from "./helpers/queryTransaction.js";
import eSchema from "./graphql/index.js";
import { publishExchange } from "./helpers/producers.js";
import getPoolForRequest from "./config/mysqlCon.js";
import compressImage from "./helpers/image_compress.js";
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import util from 'util';

process.env.TZ = 'UTC';
const app = express();
const PORT_GW = PORT_GATEWAY;
const allowedCors = FRONTEND_URL.split(',');

const corsOptions= {
    origin: function (origin, callback) {
        if (ENVIRONMENT === "development") {
            allowedCors.push('*');
        }
        console.log('allowedCors', allowedCors);
        console.log('origin', origin);
        if (!origin || allowedCors.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-tenant, x-username',
    credentials: true, 
}

// app.use(cors());
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(helmet());

app.use(expressjwt({
    secret:TOKENSECRET,
    algorithms: ['HS256']
})
.unless({
    path:['/login','/graphql','/websocket']
}));

app.use((req, res, next) => {
    const allowedIPs = ALLOWED_IPS.split(',');
    let clientIP = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.connection.remoteAddress;

    if (clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.substring(7);
    }
    const trustedOrigins = FRONTEND_URL.split(',');
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';
    console.log(`Mode: ${clientIP}, ${hostname}`);


    res.header('Access-Control-Allow-Origin', req.headers.origin); // Ensure this header is set
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (ENVIRONMENT === "development") {
        // In development, allow all access
        console.log(`Development Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
        next();
    } else if (ENVIRONMENT === "testing") {
        // In testing, restrict access only to allowed IPs
        if (allowedIPs.includes(clientIP) || hostname === "localhost" || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Testing Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname} `);
            next();
        } else {
            console.log(`Allowed IPs:`);
            console.log(allowedIPs);
            console.log(`clientIP:${clientIP}`);
            console.log(`test: ${allowedIPs.includes(clientIP.toString().trim())}`);
            console.error(`Testing Mode: Access denied to IP - ${clientIP}, Hostname - ${hostname}`);
            // return res.status(403).json({ error: 'Forbidden: IP not allowed in testing environment' });
            return res.status(403).send( {error:`Forbidden: IP not allowed in testing environment`} );
        }
    }else if (ENVIRONMENT === "production") {
        // In production, restrict to allowed IPs and trusted origins
        if (allowedIPs.includes(clientIP) || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Production Mode: Access granted to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            next();
        } else {
            console.error(`Production Mode: Access denied to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            // return res.status(403).json({ error: 'Forbidden: Access denied in production environment' });
            return res.status(403).send({error:`Request blocked`});
        }
    }else if (err.name === 'CorsError') {
        return res.status(403).json({
          error: 'CORS error: The origin is not allowed.'+error.message,
        });
    } else {
        return res.status(500).send({error:`Invalid environment configuration`} );
    }
});

app.get('/uploads/customer/ids/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('uploads/customer/ids', filename);
    console.log('filePath', filePath);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

app.get('/hello', (req, res) => {
    res.json({message: 'Request allowed'});
});

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/user/me', async (req, res) => { 
    try {
        
        if (!req.auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }else{
            res.status(200).json(req.auth);
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.get('/customers-legacy/sudah_verifikasi_oleh_pajak', async (req, res) => { 
    try {
        const otherAppUrl = `${NODE2_URL}/customers/sudah_verifikasi_oleh_pajak`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        const tgl_awal = new Date('2023-10-09');
        const customers = {};

        const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        axios.get(otherAppUrl,{params: {page: pageNumber, limit: pageSize}})
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    }
});

app.post('/customers-legacy/verifikasi_oleh_user', async (req, res) => { 

    let xTenant = "default";
    if (req.headers['x-tenant']) {
        xTenant = req.headers['x-tenant'];
    }

    let xUsername = "";
    if(req.headers['x-username']){
        xUsername = req.headers['x-username'];
        console.log('headers', req.headers);
    }

    const pool = await getPoolForRequest(xTenant); 
    const data = req.body;

    const company_indexes = data.company_indexes;
    const keyName = data.keyName;
    const keyValue = data.keyValue;

    const context = {pool: pool, username: xUsername};

    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
    try {
        const { 
            tipe_company, nama,
            alamat, blok, no, rt, rw,
            kecamatan, kelurahan, kota, provinsi, kode_pos,
            npwp, nik, 
            tempo_kredit, warning_kredit,
            limit_warning_type, limit_warning_amount,
            limit_amount, limit_atas,
            contact_person, telepon, email, medsos_link,
            status_aktif 

        } = data.data_customer;

        const cond = (keyName === 'npwp' ? `npwp = ?` : `nik = ?`);
        const condValue = (keyName === 'npwp' ? npwp : nik);
        const queryCheck = `SELECT * FROM nd_customer WHERE ${cond}`;
        const [rows] = await pool.query(queryCheck, [condValue]);
        if (rows.length > 0) {
            const ket = (keyName === 'npwp' ? `npwp: ` : `nik: `)+keyValue;
            res.status(200).json({message: `Customer tidak diinput ke central, customer dengan ${ket} sudah terdaftar`, data: rows[0]});
            const msg = {
                id:rows[0].id, 
                keyName: keyName,
                keyValue: keyValue,
                company_indexes: company_indexes,
                nama:nama
            };
            
            publishExchange('customer_legacy_events', 'customer.chosen' , Buffer.from(JSON.stringify(msg)));
            return;
        }
        
        const query = `INSERT INTO nd_customer (tipe_company, nama, alamat, blok, no, rt, rw,
        kecamatan, kelurahan, kota, provinsi, kode_pos,
        npwp, nik, tempo_kredit, warning_kredit,
        limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
        contact_person, telepon1, email, medsos_link,
        status_aktif
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?)`;

        const tipe_company_edit = tipe_company ? tipe_company : '';

        const result = await queryTransaction.insert(context, `nd_customer`, query, [tipe_company_edit, nama, alamat, blok, no, rt, rw,
            kecamatan, kelurahan, kota, provinsi, kode_pos,
            npwp, nik, tempo_kredit, warning_kredit,
            limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
            contact_person, telepon, email, medsos_link,
            status_aktif]);
        
        res.status(200).json({message: 'Success Add Customer', data:result});
        
        const msg = {
            id:result.id, 
            keyName: keyName,
            keyValue: keyValue,
            company_indexes: company_indexes,
            nama:nama
        };
        await publishExchange('customer_legacy_events', 'customer.chosen' , Buffer.from(JSON.stringify(msg)));

        return;
        
        /* const [result] = await pool.query(query, [tipe_company, nama, alamat, blok, no, rt, rw, 
          kecamatan, kelurahan, kota, provinsi, kode_pos, 
          npwp, nik, tempo_kredit, 
          warning_kredit, limit_warning_type, limit_warning_amount, 
          limit_amount, limit_atas, 
          img_link, npwp_link, ktp_link, 
          contact_person, telepon, email, medsos_link,
          status_aktif]);

        queryLogger(pool, `nd_customer`, result.insertId, query, [tipe_company, nama, alamat, blok, no, rt, rw, 
          kecamatan, kelurahan, kota, provinsi, kode_pos, 
          npwp, nik, tempo_kredit, 
          warning_kredit, limit_warning_type, limit_warning_amount, 
          limit_amount, limit_atas, 
          img_link, npwp_link, ktp_link, 
          contact_person, telepon, email, medsos_link, 
          status_aktif]);

        res.status(200).json({message: 'Success Add Customer', data:{ id: result.insertId, tipe_company, nama, alamat, blok, no, rt, rw,
            kecamatan, kelurahan, kota, provinsi, kode_pos,
            npwp, nik, tempo_kredit, warning_kredit,
            limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
            img_link, npwp_link, ktp_link,
            contact_person, telepon, email, medsos_link,
            status_aktif
        }});
        
        const msg = {
            id:result.insertId, 
            keyName: keyName,
            keyValue: keyValue,
            company_indexes: company_indexes,
            nama:nama
        };
        publishExchange('customer_legacy_events', 'customer.chosen' , Buffer.from(JSON.stringify(msg)));

        return; */
    } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Add Customer');
    }
    

    /* try {
        const otherAppUrl = `${NODE2_URL}/customers/verifikasi_oleh_user`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    } */
});

app.get('/customers-legacy/:company_index/:id', async (req, res) => { 
    const id = parseInt(req.params.id);
    const company_index = parseInt(req.params.company_index);
    console.log('company_index', company_index);
    try {
        const otherAppUrl = `${NODE2_URL}/customers/${company_index}/${id}`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    }
});

app.get('/customers-legacy/:company_index', async (req, res) => { 
    const company_index = parseInt(req.params.company_index);
    console.log('company_index', company_index);
    try {
        const otherAppUrl = `${NODE2_URL}/customers/${company_index}`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    }
});


  
// Function to handle file upload as a promise
function uploadFile(req, res, additionalPath) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadPath = 'uploads/' + additionalPath;
            cb(null, uploadPath); 
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    const upload = multer({ storage: storage });
    return new Promise((resolve, reject) => {
        console.log('uploading file');
        upload.single('image')(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(req.file);
            }
        });
    });
  }


app.post('/upload-image/temp', async (req, res) => {
    
    try {
        const file = await uploadFile(req, res, "temp/");
        const maxSize = 400 * 1024; 
        console.log('upload success');
        console.log(file);

        if(file.size > maxSize){
            console.log('Compressing image...');
            const filename = `c-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
            const compressedImagePath = path.join('uploads/temp/', filename);
            await compressImage(file, compressedImagePath);
            res.status(200).json({ message: 'Image uploaded successfully', imageName: filename });
            
        }else{
            res.status(200).json({ message: 'Image uploaded successfully', imageName: file.filename });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/upload-image/customer_ids', async (req, res) => {
    const data = req.body;
    const image_name = data.image_name;
    const customer_id = data.customer_id;

    let xTenant = "default";
    if (req.headers['x-tenant']) {
        xTenant = req.headers['x-tenant'];
    }

    let xUsername = "";
    if(req.headers['x-username']){
        xUsername = req.headers['x-username'];
        console.log('headers', req.headers);
    }
    const pool = await getPoolForRequest(xTenant); 
    
    try {
        if (!image_name || !customer_id) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const tempFilePath = path.join('uploads/temp/', image_name);
        const finalFilePath = path.join('uploads/customer/ids', image_name);
        await fsPromises.rename(tempFilePath, finalFilePath);

        const query = `UPDATE nd_customer SET img_link = ? WHERE id = ?`;
        await pool.query(query, [finalFilePath, customer_id]);
        const queryLog = `INSERT INTO query_log (table_name, affected_id, query, params, username) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(queryLog, ['nd_customer', customer_id, query, JSON.stringify([finalFilePath, customer_id]), xUsername]);
        res.status(200).json({ message: 'Image uploaded successfully'});
         
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Endpoint to handle image upload
/* app.post('/upload-image/customer/:type', upload.single('image'), (req, res) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadPath = 'uploads/';

            cb(null, 'uploads/'); // Directory to save the uploaded files
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    // Initialize upload
    const upload = multer({ storage: storage });

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.status(200).json({ message: 'Image uploaded successfully', file: req.file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
}); */

app.use(
    '/graphql',
    graphqlHTTP( async (req, res) => {
        let xTenant = "default";
        if (req.headers['x-tenant']) {
            xTenant = req.headers['x-tenant'];
        }
        
        const pool = await getPoolForRequest(xTenant);

        let xUsername = "";
        if(req.headers['x-username']){
            xUsername = req.headers['x-username'];
            console.log('headers', req.headers);
        }

        return{
            schema:eSchema,
            graphiql: true,
            context: {pool: pool, username: xUsername}
        }
    })
);

export default app;