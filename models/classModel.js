const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Class name is required"],
        unique: true,
        lowercase: true,
      },
      section:{
        type: String,
        required: [true, "Section is required"],
        unique: true,
        lowercase: true,
      },
      subject: {
        type: String,
        required: [true, "Subject is required"],
        unique: true,
        lowercase: true,        
      },
      room: {
        type: Number,
        required: true, // Optional: only if you want it to be mandatory
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }, {timestamps: true}
);

module.exports = mongoose.model("Class", classSchema);