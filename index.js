import {FRONTEND_URL, PORT_GATEWAY, ENVIRONMENT, ALLOWED_IPS, NODE2_URL, TOKENSECRET, API_KEY} from "./config/loadEnv.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import axios from 'axios';
import { expressjwt } from "express-jwt";
import { graphqlHTTP } from "express-graphql";
import helmet from "helmet";
import multer from 'multer';

// built in modules
import { queryTransaction } from "./helpers/queryTransaction.js";
import eSchema from "./graphql/index.js";
import { publishExchange } from "./rabbitMQ/producers.js";
import { setPool, getPool, closeAllPools } from "./utils/poolManager.js";
import compressImage from "./helpers/image_compress.js";
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import util from 'util';



process.env.TZ = 'UTC';
const app = express();
const PORT_GW = PORT_GATEWAY;
const allowedCors = FRONTEND_URL.split(',');
const allowedIPs = ALLOWED_IPS.split(',');

const corsOptions= {
    origin: function (origin, callback) {
        if (ENVIRONMENT === "development" || ENVIRONMENT === "test") {
            if (allowedCors.indexOf('*') === -1) {
                allowedCors.push('*');   
            }
        }
        /* console.log('allowedCors', allowedCors);
        console.log('origin', origin); */
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
// Middleware to parse JSON bodies
app.use(express.json());

let isAccessFromOffice = false;
let isAccessFromMachine = false;
let jwtExceptionRoute = ['/login','/websocket'];

console.log('environment', process.env.NODE_ENV);

app.use((req, res, next) => {
    let clientIP = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.connection.remoteAddress;

    if (clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.substring(7);
    }
    const trustedOrigins = FRONTEND_URL.split(',');

    /* if(process.env.NODE_ENV === 'test'){
        jwtExceptionRoute.push('/graphql');
        console.log('environment2', process.env.NODE_ENV);
        isAccessFromOffice = true;
        next();
    } */


    res.header('Access-Control-Allow-Origin', req.headers.origin); // Ensure this header is set
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    let hostname = "";
    hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';
    console.log(`Mode: ${clientIP}, ${hostname}`);

    const apiKey = req.headers['x-api-key'];

    if (req.headers['x-api-key'] && apiKey === API_KEY) {
        jwtExceptionRoute.push('/graphql');
        isAccessFromMachine = true;
    }else{
        if (!req.headers.origin) {
            return res.status(400).send({error:`Invalid origin`});
        }
    }

    if (ENVIRONMENT === "development") {
        // In development, allow all access
        console.log(`Development Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
        next();
    } else if (ENVIRONMENT === "test") {
        // In testing, restrict access only to allowed IPs
        if (allowedIPs.includes(clientIP) || hostname === "localhost" || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Testing Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname} `);
            next();
        } else {
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

app.use(expressjwt({
    secret:TOKENSECRET,
    algorithms: ['HS256']
})
.unless((req) => {
    if(jwtExceptionRoute.includes(req.path)){
        return true;
        
    }

    if(req.path === '/graphql' && req.method === 'POST'){
        try {
            const body = req.body;
            if(body && body.query && body.query.toLowerCase().includes('mutation login')) {
                console.log('login mutation');
                return true;
            }            
        } catch (error) {
            console.error('Error parsing GraphQL request:', error);
        }
    }


}));



(async () => {
    try {
      // Initialize the default pool
      await setPool('default');
      console.log('Default database pool initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize database pool:', error);
      process.exit(1); // Exit the process if the pool cannot be initialized
    }
  })();

app.get('/uploads/customer/ids/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.resolve('uploads/customer/ids', filename);
    // const fullUrl = `${req.protocol}://${req.get('host')}/${filePath}`;
    console.log('filePaths', filePath);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });    
});

app.get('/hello', (req, res) => {
    res.json({message: 'Request allowed'});
});


app.use(express.urlencoded({ extended: true }));

app.get('/user/me', async (req, res) => { 
    try {
        if (!req.auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }else{
            const currentTime = Math.floor(Date.now() / 1000);
            if (req.auth.exp && req.auth.exp < currentTime) {
                return res.status(401).json({ error: 'Token expired' });
            }
            res.status(200).json(req.auth);
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.get('/customers-legacy/get_bounce_back', async (req, res) => { 
    try {
        const otherAppUrl = `${NODE2_URL}/customers_bounce_back`;

        console.log(`Fetching bounce back from other app: ${otherAppUrl}`);

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

    const pool = await getPool('default'); 
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
            
            // ini coba kdu di cek manual artinya ada penambahan data di toko 
            // publishExchange('customer_legacy_events', 'customer.chosen' , Buffer.from(JSON.stringify(msg)));
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

        console.log('msg chosen', msg);
        await publishExchange('customer_legacy_events', 'customer.chosen' , Buffer.from(JSON.stringify(msg)));

        return;
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
    
    const pool = await getPool('default');
    
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
        const MAX_RETRIES = 3;
        let xTenant = "default";
        /* if (req.headers['x-tenant']) {
            xTenant = req.headers['x-tenant'];
        }
        
        
        setPool(pool[xTenant]);
        console.log('xTenant', xTenant); */
        let pool = await getPool('default');
        let retries = 0;

        while (!pool && retries < MAX_RETRIES) {
            console.warn(`Pool is null, retrying connection... (${retries + 1}/${MAX_RETRIES})`);
            pool = await getPool('default');
            retries++;
        }

        if (!pool) {
            throw new Error('Failed to establish database connection');
        }

        let xUsername = "";
        if(req.headers['x-username']){
            xUsername = req.headers['x-username'];
            console.log('headers', req.headers);
        }

        const graphiql = (isAccessFromOffice || ENVIRONMENT === "development" || ENVIRONMENT === 'test' ? true : false);

        return{
            schema:eSchema,
            graphiql: graphiql,
            context: {pool: pool, username: xUsername}
        }
    })
);

app.use((err, req, res, next) => {
    console.error('🔥 Express Error:', err.stack);
    res.status(500).json({ error: err.message });
  });
  

const gracefulShutdown = async () => {
    console.log('shuttning down gracefully...');
    closeAllPools();
    console.log('All pools closed.');
    process.exit(0);
}   

process.on('SIGINT', gracefulShutdown); // Listen for Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Listen for termination signal
process.on('beforeExit', gracefulShutdown); // Listen for process exit

export default app;