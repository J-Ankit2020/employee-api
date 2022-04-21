const express = require('express');
require('./db/mongoose');
const app = express();
const companyRouter = require('./routers/company');
const employeeRouter = require('./routers/employee');
const PORT = 3000;
app.use(express.json());
app.use(companyRouter);
app.use(employeeRouter);
app.listen(PORT, () => {
    console.log(`Server is up on ${PORT}`);
});