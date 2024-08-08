// const app = require('./api-gateway');
// const port = process.env.PORT || 3000;

import app from './api-gateway.js';
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});