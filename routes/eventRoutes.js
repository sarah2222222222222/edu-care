const express = require("express");
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  cleanExpiredEvents
} = require("../services/eventService");

const authroute = require("../services/authService");

const router = express.Router();
/* router.get("/cleanExpired", cleanExpiredEvents); // new route */
// Routes
router.route("/").get(getAllEvents).post(
  authroute.protect,
  authroute.allowedTo("teacher", "institution"),

  createEvent // <-- Save event in DB
);
// Missing individual event routes
router
  .route("/:id")
  .get(getEvent) // GET /events/:id
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    updateEvent
  ) // PUT /events/:id
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deleteEvent
  ); // DELETE /classes/:id


module.exports = router;
