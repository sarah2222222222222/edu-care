const userModel = require("../models/userModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");

// Image processing

//@desc get list of brands
//@route get/ /api/v1/brands
//@access public
exports.getUsers = factory.getMany(userModel,'User',true);

//desc     get sepsfic brand  by id
//@route    get /v1/brands/:id

exports.getUser = factory.getOne(userModel);

// desc  create brand
//@route  post/ /api/v1/brands
//@access  private
exports.createUser = factory.createOne(userModel);
//@desc     update sepcfic brand by id
//@route    put / api/v1/brand/:id
//@access   private
exports.updateUser = factory.updateOne(userModel);
//to change password or update it


exports.deleteUser = factory.deleteOne(userModel);




// controllers/userController.js
exports.getAllUsersWithClassStatus = asyncHandler(async (req, res, next) => {
    const { classId } = req.params;
    
    // Get all active users
    const users = await userModel.find({ isDeleted: false })
      .select('firstName lastName email role image classes')
      .lean(); // Convert to plain JS object
  
    // Transform data to include class membership status
    const usersWithStatus = users.map(user => ({
      ...user,
      isInClass: user.classes.some(c => c.classId.toString() === classId),
      classes: undefined // Remove the classes array from response
    }));
  
    res.status(200).json({
      status: 'success',
      results: usersWithStatus.length,
      data: usersWithStatus
    });
  });