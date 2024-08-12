// const app = require('./api-gateway');
// const port = process.env.PORT || 3000;

import gateway from './api-gateway.js';
import app from './index.js';
const port_gw = process.env.PORT_GW || 3302;
const port_user = process.env.PORT_USER || 3301;

gateway.listen(port_gw, () => {
  console.log(`Server is running on port ${port_gw}`);
});

app.listen(port_user, () => {
  console.log(`Server is running on port ${port_user}`);
});

