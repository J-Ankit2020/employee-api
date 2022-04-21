const express = require('express');
const auth = require('../middleware/auth');
const Company = require('../models/company');
const router = new express.Router();
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find({}).select("-__v -pastEmployees -currentEmployees");
        res.send(companies);
    }
    catch (e) {
        res.send({ error: e.message }).status(400);
    }
});
router.post('/company/create', auth, async (req, res) => {
    try {
        const duplicate = await Company.findOne({ name: req.body.name });
        if (duplicate) {
            throw new Error('Company already exists');
        }
        const company = new Company(req.body);
        await company.save();
        res.send('company created succesfully').status(201);
    }
    catch (e) {
        res.send({ error: e.message }).status(400);
    }
});
router.post('/company/dashboard', async (req, res) => {
    try {
        const { name } = req.body;
        let companies = await Company.findOne({ name });
        companies = await companies.populate('employees', '-_id -__v -tokens -currentCompany -companies -password')
        res.send(companies).status(200);
    }
    catch (e) {
        res.send({ error: e.message }).status(400);
    }
})
module.exports = router;