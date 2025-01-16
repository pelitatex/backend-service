// const app = require('./api-gateway');
// const port = process.env.PORT || 3000;
// import gateway from './api-gateway.js';
import app from './index.js';
import appAuth from './authorization.js';
import { PORT_GATEWAY, PORT_APP, PORT_AUTH } from './config/loadEnv.js';

const port_gw = PORT_GATEWAY
const port_user = PORT_APP;
const port_auth = PORT_AUTH;

// gateway.listen(port_gw, () => {
//   console.log(`Gateway is running on port ${port_gw}`);
// });

app.listen(port_user, () => {
  console.log(`App is running on port ${port_user}`);
});

appAuth.listen(port_gw, () => {
  console.log(`Authentication server running on port ${port_auth}`);
});
