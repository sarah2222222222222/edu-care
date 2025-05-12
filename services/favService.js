const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");

const favModel = require("../models/favModel");
const User = require("../models/userModel");
const courseModel = require("../models/courseModel");

// Factory exports for basic CRUD operations
exports.getAllfav = factory.getMany(favModel);
exports.getfav = factory.getOne(favModel);
exports.updatefav = factory.updateOne(favModel);
exports.deletefav = factory.deleteOne(favModel);
exports.createfav = factory.createOne(favModel);
// Add course to cart
exports.getUserFav = async (req, res) => {
  try {
    // Retrieve the user ID from the request (e.g., from a JWT token or session)
    const userId = req.user.id; // Assuming the user is authenticated and their ID is in req.user

    // Find the user's cart
    const userfav = await favModel
      .findOne({ user: userId })
      .populate("course"); // Populating course data

    if (!userfav) {
      return res.status(404).json({ message: "Favorites not found for this user." });
    }

    // Return the cart with the courses
    res.status(200).json({
      success: true,
      data: userfav,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve Favorites" });
  }
};
