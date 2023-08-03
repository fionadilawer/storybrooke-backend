const express = require("express");
const router = express.Router();
const commentsController = require("../../controllers/commentsController");

// Create a new comment
router
  .route("/:id")

  .post(commentsController.createComment)

  // Get a comment by id
  .get(commentsController.getComments)

  // Delete a comment by id
  .delete(commentsController.deleteComment);

module.exports = router;
