const mongoose = require('mongoose');
const { ObjectID } = require('bson');
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    employees: [{ type: ObjectID, ref: 'Employee', default: null }]
});
companySchema.methods.toJSON = function () {
    const company = this;
    const companyObject = company.toObject();
    delete companyObject.__v;
    delete companyObject._id;
    return companyObject;
}
const Company = mongoose.model('Company', companySchema);
module.exports = Company