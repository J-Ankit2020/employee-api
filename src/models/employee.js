const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Choose any other password');
        }
    },
    currentCompany: {
        type: Array,
        default: []
    },
    companies: {
        type: Array,
        default: []
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});
employeeSchema.statics.findByCredentials = async (email, password) => {
    const employee = await Employee.findOne({ email });
    if (!employee) {
        throw new Error('Email and password does not match');
    }
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
        throw new Error('Email and password does not match');
    }
    return employee;
}
employeeSchema.pre('save', async function (next) {
    const employee = this;
    if (employee.isModified('password')) {
        employee.password = await bcrypt.hash(employee.password, 8);
    }
    next();
})
employeeSchema.methods.generateAuthToken = async function () {
    // instance method
    const employee = this;
    const token = jwt.sign({ _id: employee._id.toString() }, 'decodeme', { expiresIn: '1d' });
    employee.tokens = employee.tokens.concat({ token });
    await employee.save();
    return token;
}
employeeSchema.methods.toJSON = function () {
    const employee = this;
    const employeeObject = employee.toObject();
    delete employeeObject.password;
    delete employeeObject.tokens;
    if (employeeObject.currentCompany.length > 0) {
        employeeObject.currentCompany[0].startDate = moment(employeeObject.currentCompany[0].startDate).format('MMMM Do YYYY');
    }
    else delete employeeObject.currentCompany;
    for (let i = 0; i < employeeObject.companies.length; i++) {
        employeeObject.companies[i].startDate = moment(employeeObject.companies[i].startDate).format('MMMM Do YYYY');
        employeeObject.companies[i].endDate = moment(employeeObject.companies[i].endDate).format('MMMM Do YYYY');
    }
    delete employeeObject.__v;
    return employeeObject;
}
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;