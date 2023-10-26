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
  .delete(commentsController.deleteComment)

  // create a reply
  .put(commentsController.createCommentReply);

// Update a comment by id
router.route("/edit/:id").put(commentsController.updateComment);

// delete a reply by id
router.route("/reply/:id").delete(commentsController.deleteReply);

// get replies
router.route("/replies/:id").get(commentsController.getReplies);

module.exports = router;
