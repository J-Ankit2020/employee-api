const express = require('express');
const Employee = require('../models/employee');
const auth = require('../middleware/auth');
const Company = require('../models/company');
const router = new express.Router();
router.post('/employee/signup', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        const token = await employee.generateAuthToken();
        res.send({ token, message: 'successfully signed up' }).status(201);
    }
    catch (e) {
        res.status(400).send({ error: e.message });
    }
});
router.post('/employee/login', async (req, res) => {
    try {
        const employee = await Employee.findByCredentials(req.body.email, req.body.password);
        const token = await employee.generateAuthToken();
        res.send({ token, messgae: 'successfully signed up' }).status(200);
    }
    catch (e) {
        res.send({ error: e.message }).status(400);
    }
});
router.post('/employee/logout', auth, async (req, res) => {
    try {
        req.employee.tokens = req.employee.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.employee.save();
        res.send('successfully logged out').status(200);
    } catch (error) {
        res.send({ error: error.message }).status(400);
    }
});
router.patch('/employee/join', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const company = await Company.findOne({ name });
        if (!company) {
            throw new Error('Company not found');
        }
        company.employees.push(req.employee._id);
        await company.save();
        if (req.employee.currentCompany.length == 0) {
            req.employee.currentCompany.push({ name: company.name, startDate: new Date() });
            await req.employee.save();
        }
        else {
            throw new Error('You are already in a company');
        }
        res.send(req.employee).status(200);
    } catch (error) {
        res.send({ error: error.message }).status(400);
    }
});
router.patch('/employee/leave', auth, async (req, res) => {
    try {
        if (req.employee.currentCompany.length == 0) {
            throw new Error('You are not working for a company');
        }
        req.employee.companies.push({
            name: req.employee.currentCompany[0].name,
            startDate: req.employee.currentCompany[0].startDate,
            endDate: new Date()
        })
        req.employee.currentCompany = [];
        await req.employee.save();
        res.send(req.employee).status(200);
    } catch (error) {
        res.send({ error: error.message }).status(400);
    }
});
router.get('/employee/dashboard', auth, async (req, res) => {
    try {
        res.send(req.employee).status(200);
    }
    catch (e) { res.send({ error: e.message }).status(400); }
})
module.exports = router;