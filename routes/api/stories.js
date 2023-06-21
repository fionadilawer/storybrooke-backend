const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const storiesController = require("../../controllers/storiesController");
const verifyRoles = require("../../middleware/verifyRoles");

// GLOBAL ROUTES
router
  .route("/")

  .post(storiesController.createStory)

  .get(storiesController.getAllStoriesGlobal);

// SPECIFIC ROUTES
router
  .route("/:id")

  // update story in the database by ID
  .put(storiesController.updateStory)
  .delete(storiesController.deleteStory)

  // get story from the database by ID
  .get(storiesController.getStoryById);

// get story from the database by title
router.route("/title/:title").get(storiesController.getStoryGlobal);

// count all the stories in the database
router.route("/count").get(storiesController.countStoriesGlobal);

// get all stories by author
router.route("/author/:author").get(storiesController.getStoriesByAuthor);

// get all stories in a genre
router.route("/find/:genre").get(storiesController.getAllStoriesInGenre);

module.exports = router;
