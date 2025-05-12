const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");

const eventModel = require("../models/eventModel");
const sharp = require("sharp");
const cron = require("node-cron");





exports.getAllEvents = factory.getMany(eventModel,{ isDeleted: false });
exports.getEvent = factory.getOne(eventModel);
exports.createEvent = factory.createOne(eventModel);
exports.updateEvent = factory.updateOne(eventModel);
exports.deleteEvent = factory.deleteOne(eventModel);



cron.schedule("0 0 * * *", async () => {
  try {
    const result = await eventModel.markExpiredEventsAsDeleted();
    console.log("Expired events marked as deleted:", result.modifiedCount || result.nModified);
  } catch (err) {
    console.error("Error auto-deleting expired events:", err);
  }
});

exports.cleanExpiredEvents = asyncHandler(async (req, res) => {
  const result = await eventModel.markExpiredEventsAsDeleted();
  res.status(200).json({
    status: "success",
    message: "Expired events cleaned",
    result
  });
});