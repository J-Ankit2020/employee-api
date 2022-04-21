const jwt = require('jsonwebtoken');
const Employee = require('../models/employee');
const auth = async (req, res, next) => {
    // middleware
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'decodeme');
        const employee = await Employee.findOne({
            _id: decoded._id,
            'tokens.token': token
        });
        if (!employee) {
            throw new Error();
        }
        req.employee = employee;
        req.token = token;
        next();
    }
    catch (e) {
        res.send({ error: 'Please authenticate ' });
    }
}
module.exports = auth;