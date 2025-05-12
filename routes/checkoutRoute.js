const express = require("express");

const {
    getAllcheckout,
    getcheckout,
    updatecheckout,
    deletecheckout,
    createcheckout,
  } = require("../services/checkoutService");

  const authroute = require("../services/authService");

const router = express.Router();

router.route("/").get(getAllcheckout).post(authroute.protect, authroute.allowedTo("teacher", "institution","student"),createcheckout);
router.route("/:id").get(getcheckout).put(updatecheckout).delete(deletecheckout);
module.exports = router;