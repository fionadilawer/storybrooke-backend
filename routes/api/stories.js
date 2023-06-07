const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const storiesController = require("../../controllers/storiesController");
const verifyRoles = require("../../middleware/verifyRoles");

// GLOBAL ROUTES
router
  .route("/")
  // .get(storiesController.getAllStories)

  .post(storiesController.createStory)

  // .delete(
  //   // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  //   storiesController.deleteStory
  // )

  .get(storiesController.getAllStoriesGlobal);

// SPECIFIC ROUTES
router
  .route("/:id")

  // update story in the database by ID
  .put(
    // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storiesController.updateStory
  )
  .delete(
    // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storiesController.deleteStory
  )

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

// .delete(
//   verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
//   storiesController.deleteStoryGenre
// );

// router.route("/:genre/find").get(storiesController.getStory);

module.exports = router;
