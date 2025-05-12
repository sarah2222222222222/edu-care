const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");
const courseModel = require("../models/courseModel");
const favModel = require("../models/favModel");
// Create One
exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (Model.modelName === "Post" && req.user.role !== "teacher") {
      return next(new ApiError("Only teachers can create posts", 403));
    }

    if (!req.body.user) {
      req.body.user = req.user._id;
    }

    if (req.body.user.toString() !== req.user._id.toString()) {
      return next(
        new ApiError("You are not authorized to perform this action", 403)
      );
    }

    if (Model.modelName === "Post" && req.params.classId) {
      req.body.class = req.params.classId;
    }

    // ------------------ CART LOGIC ------------------
    if (Model.modelName === "Cart") {
      const courseIds = req.body.courseId;
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        return next(new ApiError("At least one course ID is required", 400));
      }

      const courses = await courseModel.find({ _id: { $in: courseIds } });
      if (courses.length !== courseIds.length) {
        return next(new ApiError("Some courses not found", 404));
      }

      let cart = await cartModel.findOne({ user: req.user._id });

      if (!cart) {
        cart = await cartModel.create({
          user: req.user._id,
          course: courseIds,
          totalAmount: courses.reduce(
            (sum, course) => sum + (course.price || 0),
            0
          ),
        });

        const populatedCart = await cartModel
          .findById(cart._id)
          .populate("course", "price name title");

        return res.status(201).json({ data: populatedCart });
      }

      // Remove duplicates by filtering out courses that are already in the cart
      const uniqueCourseIds = Array.from(
        new Set([...cart.course, ...courseIds])
      );

      // Ensure unique course IDs are pushed into the cart
      for (const courseId of courseIds) {
        const exists = cart.course.some(
          (c) => c.toString() === courseId.toString()
        );
        if (!exists) {
          cart.course.push(courseId);
        }
      }

      // Recalculate totalAmount based on the unique courses in the cart
      const uniqueCourses = await courseModel.find({
        _id: { $in: uniqueCourseIds },
      });
      cart.totalAmount = uniqueCourses.reduce(
        (sum, course) => sum + (course.price || 0),
        0
      );

      // Save the updated cart
      await cart.save();

      // Populate the cart with course details
      const populatedCart = await cartModel
        .findById(cart._id)
        .populate("course", "price name title");

      // Removing duplicate courses from the populated cart before returning
      const uniqueCoursesInCart = populatedCart.course.filter(
        (value, index, self) =>
          index ===
          self.findIndex((t) => t._id.toString() === value._id.toString())
      );

      populatedCart.course = uniqueCoursesInCart;

      return res
        .status(200)
        .json({ message: "Cart updated", data: populatedCart });
    }
    // ------------------ FAVORITES LOGIC ------------------
    if (Model.modelName === "Fav") {
      const courseId = req.body.courseId; // Expecting an array of course IDs to add to favorites

      if (!courseId || !Array.isArray(courseId) || courseId.length === 0) {
        return next(new ApiError("At least one course ID is required", 400));
      }

      // Fetch courses by their IDs
      const courses = await courseModel.find({ _id: { $in: courseId } });

      if (courses.length !== courseId.length) {
        return next(new ApiError("Some courses not found", 404));
      }

      // Check if the user already has a favorites list
      let fav = await favModel.findOne({ user: req.user._id });

      if (!fav) {
        // Create a new favorites list if none exists
        fav = await favModel.create({
          user: req.user._id,
          course: courseId,
        });

        // Populate the course field with data from the course model
        const populatedFav = await favModel
          .findById(fav._id)
          .populate("course", "price name title"); // Populating the course data (price, name, title)

        return res.status(201).json({ data: populatedFav });
      }

      // Add courses to the favorites array, ensuring uniqueness
      const uniqueCourseIds = Array.from(
        new Set([...fav.course, ...courseId])
      );

      // Update the favorites list
      fav.course = uniqueCourseIds;

      await fav.save();

      return res.status(200).json({ message: "Favorites updated", data: fav });
    }

    // ------------------ CHECKOUT LOGIC ------------------
    if (Model.modelName === "Checkout") {
      const { cart: cartId } = req.body;

      if (!cartId) {
        return next(new ApiError("Cart ID is required for checkout", 400));
      }

      const cart = await cartModel
        .findById(cartId)
        .populate("course", "price name title");

      if (!cart) {
        return next(new ApiError("Cart not found", 404));
      }

      req.body.totalAmount = cart.totalAmount;
    }

    // ------------------ DEFAULT CREATION ------------------
    const newDoc = await Model.create(req.body);

    if (Model.modelName === "CheckOut") {
      const populatedCheckout = await Model.findById(newDoc._id).populate({
        path: "cart",
        populate: { path: "course", select: "price name title" },
      });

      return res.status(201).json({ data: populatedCheckout });
    }

    res.status(201).json({ data: newDoc });
  });

// Get One (excluding soft-deleted)
exports.getOne = (Model, populateUser = false) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Initialize the query
    let query = Model.findOne({ _id: id, isDeleted: false });

    // Conditionally populate 'user' field if needed
    if (populateUser) {
      query = query.populate("user", "firstName lastName email");
    }

    // Execute the query to find the document
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document found with ID ${id}`, 404));
    }

    // Convert to plain object to modify safely
    const data = document.toObject();

    // If the model has a `comments` field, filter soft-deleted ones
    if (Array.isArray(data.comments)) {
      data.comments = data.comments.filter((comment) => !comment.deletedAt);
    }

    res.status(200).json({ data });
  });

exports.getByQuery = (Model) =>
  asyncHandler(async (req, res, next) => {
    const query = { ...req.query, isDeleted: false };

    const documents = await Model.find(query);

    if (!documents.length) {
      return next(new ApiError("No documents found matching query", 404));
    }

    // Clean up nested soft-deleted comments, if present
    const data = documents.map((doc) => {
      const obj = doc.toObject();
      if (Array.isArray(obj.comments)) {
        obj.comments = obj.comments.filter((comment) => !comment.deletedAt);
      }
      return obj;
    });

    res.status(200).json({ data });
  });
// Get Many (excluding soft-deleted)
exports.getMany = (Model, modelName = "", populateUser = false) =>
  asyncHandler(async (req, res) => {
    // Default filter to exclude deleted documents
    let filter = { isDeleted: false };

    // Apply custom filters if provided in req.filterObj
    if (req.filterObj) {
      filter = { ...req.filterObj, isDeleted: false };
    }

    // Check if pagination is needed (if limit is not -1 or is not provided)
    const noPagination = req.query.limit === "-1" || !req.query.limit;

    // Get the count of documents to assist in pagination
    const documentsCount = await Model.countDocuments(filter);

    // Initialize the query
    let query = Model.find(filter);

    // Conditionally apply .populate() if populateUser is true
    if (populateUser) {
      query = query.populate("user", "firstName lastName email");
    }

    // Apply API features such as search, filtering, sorting, and field limiting
    const apiFeatures = new ApiFeatures(query, req.query)
      .search(modelName) // Apply the dynamic search
      .filter() // Apply custom filters
      .limitFields() // Limit the fields in the response
      .sort(); // Apply sorting

    // Conditionally apply pagination if needed
    if (!noPagination) {
      apiFeatures.paginate(documentsCount);
    }

    // Execute the query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    // Prepare the response object
    const response = {
      results: documents.length,
      data: documents,
    };

    // If pagination was applied, add the pagination result to the response
    if (!noPagination) {
      response.paginationResult = paginationResult;
    }

    // Send the response back to the client
    res.status(200).json(response);
  });

// Update One
exports.updateOne = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const { requireAuthCheck = false, fieldFilterFn = null } = options;




    // Optional authorization check
    if (
      requireAuthCheck &&
      req.user?._id?.toString() !== req.params.id.toString()
    ) {
      return next(
        new ApiError("You are not authorized to perform this action", 403)
      );
    }

    // Optional: filter allowed update fields
    const updateData = fieldFilterFn ? fieldFilterFn(req.body) : req.body;

    // Apply soft delete condition if the model supports it
    const filter = { _id: req.params.id };
    if (Model.schema.paths.isDeleted) {
      filter.isDeleted = false;
    }

    const document = await Model.findOneAndUpdate(filter, updateData, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document found for ID ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ data: document });
  });

// Soft Delete One
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!document) {
      return next(new ApiError(`No document found for ID ${id}`, 404));
    }

    return res.status(200).json({
      message: `Item with ID ${id} has been soft deleted.`,
      data: document,
    });
  });

// Restore (Undo Delete)
exports.restoreOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!document) {
      return next(new ApiError(`No deleted document found with ID ${id}`, 404));
    }

    return res.status(200).json({
      message: `Item with ID ${id} has been restored.`,
      data: document,
    });
  });
