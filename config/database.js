const mongoose = require("mongoose");

const dbconnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`data conncted: ${conn.connection.host}`);
  });
}
module.exports = dbconnection;
