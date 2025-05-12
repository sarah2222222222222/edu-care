const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");
const gradeModel = require("../models/gradeModel");
const userModel = require("../models/userModel");
const sharp = require("sharp");
const path = require("path");


exports.getAllGrades = factory.getMany(gradeModel);
exports.getGrade = factory.getOne(gradeModel);
exports.createGrade = factory.createOne(gradeModel);
exports.updateGrade = factory.updateOne(gradeModel);
exports.deleteGrade = factory.deleteOne(gradeModel);

