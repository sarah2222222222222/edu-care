const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");
const ClassModel = require("../models/classModel");
const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError")
exports.getAllClasses = factory.getMany(ClassModel);
exports.getClass = factory.getOne(ClassModel);
exports.createClass = factory.createOne(ClassModel);
exports.updateClass = factory.updateOne(ClassModel);
exports.deleteClass = factory.deleteOne(ClassModel);
const mongoose = require("mongoose");


// Join a classroom (teacher or student)
exports.joinClassRoom = asyncHandler(async (req, res, next) => {
    const { classId } = req.body;
    const userId = req.user.id;
  
    // 1. Check class existence
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return next(new ApiError("Class not found", 404));
    }
  
    // 2. Check if user is allowed to join
    const isAllowed = classDoc.allowedUsers?.some(
      (id) => id.toString() === userId
    );
  
    if (!isAllowed) {
      return next(new ApiError("You don't have access to join this class", 403));
    }
  
    // 3. Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
  
    // 4. Check if user already joined
    const alreadyJoined = user.classes?.some(
      (c) => c.classId.toString() === classId
    );
  
    if (!alreadyJoined) {
      user.classes.push({
        classId,
        joinedAt: new Date(),
      });
      await user.save();
    }
  
    res.status(200).json({
      message: alreadyJoined
        ? "You have already joined this class."
        : "Successfully joined the classroom.",
      data: {
        class: classDoc.name,
        room: classDoc.room,
        subject: classDoc.subject,
      },
    });
  });
  

  exports.addUserToClass = async (req, res, next) => {
    const { classId } = req.params;
    const { userId } = req.body;




    const currentUserId = req.user.id;
  
    try {
      // 1. Find the class by ID
      const classDoc = await ClassModel.findById(classId);
      if (!classDoc) {
        return next(new ApiError("Class not found", 404));
      }
  
      // 2. Check if the current user is in the allowedUsers array
      const isAllowed = classDoc.allowedUsers.includes(currentUserId);
      if (!isAllowed) {
        return next(new ApiError("You do not have permission to add users to this class", 403));
      }
  
      // 3. Find the user to be added
      const userToAdd = await userModel.findById(userId);
      if (!userToAdd) {
        return next(new ApiError("User not found", 404));
      }
  
      // 4. Add the user to the allowedUsers array if not already present
      if (!classDoc.allowedUsers.includes(userId)) {
        classDoc.allowedUsers.push(userId);
        await classDoc.save();
      }
  
      res.status(200).json({
        message: "User added to the class successfully",
        data: {
          class: classDoc.name,
          allowedUsers: classDoc.allowedUsers,
        },
      });
    } catch (error) {
      next(error);
    }
  };



  exports.getDeletedClasses = asyncHandler(async (req, res, next) => {
    const deletedClasses = await ClassModel.find({ isDeleted: true }).select('-__v');
    res.status(200).json({
      success: true,
      data: deletedClasses,
    });
  });