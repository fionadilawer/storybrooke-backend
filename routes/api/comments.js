const express = require("express");
const router = express.Router();
const commentsController = require("../../controllers/commentsController");

// Create a new comment
router.route("/:id").post(commentsController.createComment);

module.exports = router;