const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");


const checkoutModel = require("../models/checkOutModel");



exports.getAllcheckout = factory.getMany(checkoutModel);
exports.getcheckout = factory.getOne(checkoutModel);
exports.updatecheckout = factory.updateOne(checkoutModel);
exports.deletecheckout = factory.deleteOne(checkoutModel);
exports.createcheckout = factory.createOne(checkoutModel);
