const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    unique: true,
    lowercase: true,
  },
  date: {
    type: Date,
    required: true,
  
  },

  class: {
    type: mongoose.Schema.ObjectId,
    ref: "Class",
    required: [true, "Event must belong to a class"],

  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });



eventSchema.statics.markExpiredEventsAsDeleted = async function () {
  const now = new Date();
  return await this.updateMany(
    { date: { $lt: now }, isDeleted: false },
    { $set: { isDeleted: true } }
  );
};
module.exports = mongoose.model("Event", eventSchema);
