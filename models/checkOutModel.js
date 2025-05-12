const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Fullname is required"],
    unique: true,
   
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
   
  },
  phone: {
    type: Number,
    required: true,
  },

  address: {
    type: String,
    required: true,
  
  },

  pincode :{
    type: Number,
    
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },


  isDeleted: {
    type: Boolean,
    default: false,
  },
  cart:{   
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
      }
}, { timestamps: true });


function autoPopulateCourses(next) {
  this.populate({
    path: "cart",
    select: "totalAmount",

  });
  next();
}

checkoutSchema.pre("find", autoPopulateCourses);
checkoutSchema.pre("findOne", autoPopulateCourses);
checkoutSchema.pre("findOneAndUpdate", autoPopulateCourses);
checkoutSchema.pre("findById", autoPopulateCourses);

module.exports = mongoose.model("CheckOut", checkoutSchema);
